import { useRouter } from "expo-router";
import { View } from "react-native";
import {
  Empty,
  Header,
  ListingCard,
  Screen,
  styles,
} from "../src/components/ui";
import { REGIONS } from "../src/config/regions";
import { useAppStore } from "../src/store/AppStore";
export default function Saved() {
  const router = useRouter();
  const { listings, favouriteIds, toggleFavourite, preferences } =
    useAppStore();
  const saved = listings.filter((x) => favouriteIds.includes(x.id));
  const symbol = REGIONS[preferences.countryCode].symbol;
  return (
    <Screen>
      <Header
        title="Saved Items"
        subtitle="Keep interesting finds together while you decide."
      />
      {saved.length ? (
        <View style={styles.wrap}>
          {saved.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              symbol={symbol}
              favourite
              onFavourite={() => toggleFavourite(l.id)}
              onPress={() => router.push(`/item/${l.id}`)}
            />
          ))}
        </View>
      ) : (
        <Empty
          icon="heart-outline"
          title="Nothing saved yet"
          body="Tap the heart on a listing to save it here."
        />
      )}
    </Screen>
  );
}
