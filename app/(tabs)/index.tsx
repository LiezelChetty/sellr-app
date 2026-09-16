import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  Button,
  Card,
  DemoBanner,
  Empty,
  money,
  Screen,
  styles,
  Wordmark,
} from "../../src/components/ui";
import { REGIONS } from "../../src/config/marketplaces";
import { useAppStore } from "../../src/store/AppStore";
import { colors } from "../../src/theme";

export default function Home() {
  const router = useRouter();
  const { listings, preferences } = useAppStore();
  const symbol = REGIONS[preferences.countryCode].symbol;
  const sold = listings.filter((x) => x.soldAt);
  const active = listings.filter((x) => !x.soldAt);
  return (
    <Screen>
      <Wordmark />
      <Text style={styles.h1}>Ready to make some space?</Text>
      <DemoBanner />
      <Card style={{ backgroundColor: colors.green, paddingVertical: 24 }}>
        <Text style={{ color: "#CFE0D7", fontWeight: "800", letterSpacing: 1 }}>
          START HERE
        </Text>
        <Text style={{ color: colors.white, fontSize: 26, fontWeight: "900" }}>
          Turn clutter into cash.
        </Text>
        <Text style={{ color: "#E3ECE7", fontSize: 15 }}>
          Photograph once. SELLR does the preparation.
        </Text>
        <Button
          label="SELL SOMETHING"
          icon="camera-outline"
          variant="secondary"
          onPress={() => router.push("/sell")}
        />
            <Button
              label="Choose from Photos"
              icon="images-outline"
              variant="secondary"
              onPress={() => router.push("/sell?source=library")}
            />
      </Card>
      <View style={[styles.wrap, { justifyContent: "space-between" }]}>
        {[
          {
            l: "Potential Value",
            v: money(
              symbol,
              active.reduce((a, b) => a + b.recommendedPrice, 0),
            ),
          },
          {
            l: "Money Made",
            v: money(
              symbol,
              sold.reduce((a, b) => a + (b.salePrice ?? 0), 0),
            ),
          },
          { l: "Active Listings", v: String(active.length) },
          { l: "Items Sold", v: String(sold.length) },
        ].map((s) => (
          <Card key={s.l} style={styles.stat}>
            <Text style={styles.small}>{s.l}</Text>
            <Text style={styles.statValue}>{s.v}</Text>
          </Card>
        ))}
      </View>
      <Card style={{ backgroundColor: "#EBDCC9" }}>
        <View style={styles.between}>
          <View style={{ flex: 1, gap: 7 }}>
            <Text style={styles.h2}>Find {symbol}100 in your home</Text>
            <Text style={styles.body}>
              Start scanning things you no longer use and see what they could be
              worth.
            </Text>
          </View>
          <Ionicons name="flag-outline" size={32} color={colors.green} />
        </View>
        <Button
          label="Start a Clear-Out"
          variant="secondary"
          onPress={() => router.push("/sell")}
        />
      </Card>
      <View style={styles.between}>
        <Text style={styles.h2}>Recent items</Text>
        {listings.length ? (
          <Pressable onPress={() => router.push("/(tabs)/items")}>
            <Text style={{ color: colors.green, fontWeight: "800" }}>
              See all
            </Text>
          </Pressable>
        ) : null}
      </View>
      {!listings.length ? (
        <Empty
          title="Your clear-out starts here"
          body="Items you prepare will appear here."
        />
      ) : (
        listings.slice(0, 3).map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(`/item/${item.id}`)}
          >
            <Card style={styles.row}>
              {item.photos[0] ? (
                <Image
                  source={{ uri: item.photos[0] }}
                  style={{ width: 62, height: 62, borderRadius: 14 }}
                />
              ) : (
                <Ionicons name="image-outline" size={30} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.h3}>{item.title}</Text>
                <Text style={styles.small}>
                  {money(symbol, item.recommendedPrice)} ·{" "}
                  {item.marketplaceListings.length} marketplaces
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
