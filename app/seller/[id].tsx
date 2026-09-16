import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";
import {
  Button,
  DemoTag,
  Header,
  ListingCard,
  Screen,
  styles,
} from "../../src/components/ui";
import { REGIONS } from "../../src/config/regions";
import { useAppStore } from "../../src/store/AppStore";
export default function Seller() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    profiles,
    listings,
    sales,
    preferences,
    favouriteIds,
    toggleFavourite,
  } = useAppStore();
  const seller = profiles.find((x) => x.id === id);
  if (!seller)
    return (
      <Screen>
        <Header title="Seller not found" />
      </Screen>
    );
  const items = listings.filter(
    (x) => x.sellerId === seller.id && x.status === "LIVE",
  );
  const sold = listings.filter(
    (x) => x.sellerId === seller.id && x.status === "SOLD",
  ).length;
  const symbol = REGIONS[preferences.countryCode].symbol;
  return (
    <Screen>
      <Header
        title={seller.displayName}
        subtitle={`${seller.approximateLocation} · Member since ${new Date(seller.memberSince).getFullYear()}`}
      />
      <DemoTag text="Development seller profile" />
      <View style={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.h1}>{items.length}</Text>
          <Text style={styles.small}>Active items</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.h1}>{sold}</Text>
          <Text style={styles.small}>Sold items</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.h1}>
            {sales.filter((x) => x.sellerId === seller.id).length}
          </Text>
          <Text style={styles.small}>Public sales</Text>
        </View>
      </View>
      <Text style={styles.h2}>Items for sale</Text>
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
      <Button label="Block user" variant="ghost" onPress={() => {}} />
      <Text style={styles.small}>
        Blocking and reporting are service boundaries only until authenticated
        moderation is connected.
      </Text>
    </Screen>
  );
}
