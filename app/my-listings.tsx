import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import {
  Card,
  Empty,
  Header,
  money,
  Screen,
  styles,
} from "../src/components/ui";
import { REGIONS } from "../src/config/regions";
import { useAppStore } from "../src/store/AppStore";
export default function MyListings() {
  const router = useRouter();
  const { listings, preferences, currentUserId } = useAppStore();
  const mine = listings.filter((x) => x.sellerId === currentUserId);
  const symbol = REGIONS[preferences.countryCode].symbol;
  return (
    <Screen>
      <Header
        title="My Listings"
        subtitle="Manage availability manually. OfferMe never assumes payment happened."
      />
      {mine.length ? (
        mine.map((l) => (
          <Pressable key={l.id} onPress={() => router.push(`/item/${l.id}`)}>
            <Card>
              <Text style={styles.h2}>{l.title}</Text>
              <Text style={styles.body}>
                {money(symbol, l.askingPrice)} · {l.status}
              </Text>
              <Text style={styles.small}>{l.approximateLocation}</Text>
            </Card>
          </Pressable>
        ))
      ) : (
        <Empty
          title="No listings yet"
          body="Start selling to create your first listing."
        />
      )}
    </Screen>
  );
}
