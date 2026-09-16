import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
import {
  DemoTag,
  Header,
  ListingCard,
  Screen,
  styles,
} from "../../src/components/ui";
import { REGIONS } from "../../src/config/regions";
import { useAppStore } from "../../src/store/AppStore";
export default function Sale() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sales, listings, preferences, favouriteIds, toggleFavourite } =
    useAppStore();
  const sale = sales.find((x) => x.id === id);
  if (!sale)
    return (
      <Screen>
        <Header title="Sale not found" />
      </Screen>
    );
  const items = listings.filter(
    (x) => x.saleId === sale.id && x.status === "LIVE",
  );
  const symbol = REGIONS[preferences.countryCode].symbol;
  return (
    <Screen>
      {sale.coverImage ? (
        <Image
          source={{ uri: sale.coverImage }}
          style={{ width: "100%", height: 220, borderRadius: 18 }}
        />
      ) : null}
      <Header
        eyebrow="ONLINE GARAGE SALE"
        title={sale.title}
        subtitle={`${sale.approximateLocation} · ${items.length} available items`}
      />
      <DemoTag />
      <Text style={styles.body}>{sale.description}</Text>
      <View style={styles.wrap}>
        {items.map((l) => (
          <ListingCard
            key={l.id}
            listing={l}
            symbol={symbol}
            favourite={favouriteIds.includes(l.id)}
            onFavourite={() => toggleFavourite(l.id)}
            onPress={() => router.push(`/item/${l.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}
