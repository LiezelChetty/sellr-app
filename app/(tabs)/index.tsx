import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import {
  CATEGORIES,
  formatApproximateLocation,
  isApproximateLocationInRegion,
  REGIONS,
} from "../../src/config/regions";
import {
  DemoTag,
  ListingCard,
  Logo,
  Screen,
  styles,
} from "../../src/components/ui";
import { useAppStore } from "../../src/store/AppStore";
import { colors } from "../../src/theme";
const categoryIcons: (keyof typeof Ionicons.glyphMap)[] = [
  "home-outline",
  "happy-outline",
  "shirt-outline",
  "phone-portrait-outline",
  "leaf-outline",
  "football-outline",
  "grid-outline",
];
export default function Home() {
  const router = useRouter();
  const { listings, sales, preferences, favouriteIds, toggleFavourite } =
    useAppStore();
  const symbol = REGIONS[preferences.countryCode].symbol;
  const broadLocation = formatApproximateLocation(
    preferences.countryCode,
    preferences.region,
    preferences.town,
  );
  const live = listings.filter(
    (x) =>
      x.status === "LIVE" &&
      isApproximateLocationInRegion(
        preferences.countryCode,
        preferences.region,
        x.approximateLocation,
      ),
  );
  const nearbySales = sales.filter((sale) =>
    isApproximateLocationInRegion(
      preferences.countryCode,
      preferences.region,
      sale.approximateLocation,
    ),
  );
  return (
    <Screen>
      <View style={styles.between}>
        <Logo />
        <Pressable style={styles.row}>
          <Ionicons
            name="location-outline"
            size={18}
            color={colors.greenDark}
          />
          <Text style={styles.h3}>
            {preferences.town || preferences.region}
          </Text>
        </Pressable>
      </View>
      <DemoTag text={`Regional development data · ${broadLocation}`} />
      <Pressable
        onPress={() => router.push("/(tabs)/browse")}
        style={[
          styles.row,
          {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
            borderRadius: 15,
            paddingHorizontal: 14,
            minHeight: 49,
          },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.muted} />
        <Text style={styles.subtitle}>What are you looking for?</Text>
      </Pressable>
      <View style={styles.between}>
        <Text style={styles.h2}>Near you</Text>
        <Pressable onPress={() => router.push("/(tabs)/browse")}>
          <Text style={{ fontWeight: "800", color: colors.greenDark }}>
            See all
          </Text>
        </Pressable>
      </View>
      <View style={styles.wrap}>
        {live.slice(0, 4).map((l) => (
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
      <View style={styles.between}>
        <Text style={styles.h2}>Garage sales near you</Text>
      </View>
      <View style={{ gap: 10 }}>
        {nearbySales.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => router.push(`/sale/${s.id}`)}
            style={[styles.card, { padding: 0, overflow: "hidden" }]}
          >
            <Image
              source={{ uri: s.coverImage }}
              style={{ width: "100%", height: 145 }}
            />
            <View style={{ padding: 13, gap: 3 }}>
              <Text style={styles.h2}>{s.title}</Text>
              <Text style={styles.small}>
                {s.approximateLocation} · {s.itemCount} items · DEMO
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
      <Text style={styles.h2}>Categories</Text>
      <View style={styles.wrap}>
        {CATEGORIES.map((c, i) => (
          <Pressable
            key={c}
            onPress={() => router.push(`/(tabs)/browse?category=${c}`)}
            style={{
              width: "31%",
              minHeight: 80,
              borderRadius: 15,
              backgroundColor: i % 2 ? colors.greenSoft : "#FFF3C7",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Ionicons
              name={categoryIcons[i]}
              size={24}
              color={colors.greenDark}
            />
            <Text style={styles.h3}>{c}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
