import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { CATEGORIES, REGIONS } from "../../src/config/regions";
import {
  DemoTag,
  Header,
  ListingCard,
  Pill,
  Screen,
  styles,
} from "../../src/components/ui";
import { useAppStore } from "../../src/store/AppStore";
import { colors } from "../../src/theme";
type Sort = "Near You" | "Newest" | "Price low-high" | "Price high-low";
export default function Browse() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { listings, preferences, favouriteIds, toggleFavourite } =
    useAppStore();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(params.category ?? "All");
  const [sort, setSort] = useState<Sort>("Near You");
  const symbol = REGIONS[preferences.countryCode].symbol;
  const shown = useMemo(
    () =>
      listings
        .filter(
          (x) =>
            x.status === "LIVE" &&
            (category === "All" || x.category === category) &&
            `${x.title} ${x.description}`
              .toLowerCase()
              .includes(q.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "Price low-high"
            ? a.askingPrice - b.askingPrice
            : sort === "Price high-low"
              ? b.askingPrice - a.askingPrice
              : new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        ),
    [listings, q, category, sort],
  );
  return (
    <Screen>
      <Header
        title="Browse"
        subtitle="Discover useful things and clear-outs around your broad area."
      />
      <DemoTag />
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search items"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <View style={styles.wrap}>
        {["All", ...CATEGORIES].map((c) => (
          <Pill
            key={c}
            label={c}
            active={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </View>
      <View style={styles.wrap}>
        {(
          ["Near You", "Newest", "Price low-high", "Price high-low"] as Sort[]
        ).map((s) => (
          <Pill
            key={s}
            label={s}
            active={sort === s}
            onPress={() => setSort(s)}
          />
        ))}
      </View>
      <Text style={styles.small}>
        {shown.length} demo results · location shown at town/county level
      </Text>
      <View style={styles.wrap}>
        {shown.map((l) => (
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
