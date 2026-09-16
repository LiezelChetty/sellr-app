import { Text, View } from "react-native";
import {
  Card,
  DemoBanner,
  Header,
  money,
  Screen,
  styles,
} from "../../src/components/ui";
import { REGIONS } from "../../src/config/marketplaces";
import { useAppStore } from "../../src/store/AppStore";
import { colors } from "../../src/theme";
export default function Insights() {
  const { listings, preferences } = useAppStore();
  const symbol = REGIONS[preferences.countryCode].symbol;
  const sold = listings.filter((x) => x.soldAt);
  const active = listings.filter((x) => !x.soldAt);
  const month = sold.filter(
    (x) => x.soldAt && new Date(x.soldAt).getMonth() === new Date().getMonth(),
  );
  const categories = Array.from(new Set(listings.map((x) => x.category))).map(
    (c) => ({
      name: c,
      count: listings.filter((x) => x.category === c).length,
    }),
  );
  return (
    <Screen>
      <Header
        eyebrow="YOUR PROGRESS"
        title="Insights"
        subtitle="A simple view of what you have prepared and sold."
      />
      <DemoBanner />
      <Card style={{ backgroundColor: colors.green }}>
        <Text style={{ color: "#CEE0D6", fontWeight: "800" }}>
          TOTAL EARNINGS
        </Text>
        <Text style={{ color: colors.white, fontWeight: "900", fontSize: 42 }}>
          {money(
            symbol,
            sold.reduce((a, b) => a + (b.salePrice ?? 0), 0),
          )}
        </Text>
        <Text style={{ color: "#CEE0D6" }}>
          This month ·{" "}
          {money(
            symbol,
            month.reduce((a, b) => a + (b.salePrice ?? 0), 0),
          )}
        </Text>
      </Card>
      <View style={styles.wrap}>
        {[
          {
            l: "Potential value",
            v: money(
              symbol,
              active.reduce((a, b) => a + b.recommendedPrice, 0),
            ),
          },
          {
            l: "Items listed",
            v: String(
              listings.filter((x) =>
                x.marketplaceListings.some((m) => m.status === "LIVE"),
              ).length,
            ),
          },
          { l: "Items sold", v: String(sold.length) },
        ].map((x) => (
          <Card key={x.l} style={styles.stat}>
            <Text style={styles.small}>{x.l}</Text>
            <Text style={styles.statValue}>{x.v}</Text>
          </Card>
        ))}
      </View>
      <Text style={styles.h2}>Category breakdown</Text>
      <Card>
        {categories.length ? (
          categories.map((c, i) => (
            <View key={c.name}>
              <View style={styles.between}>
                <Text style={styles.body}>{c.name}</Text>
                <Text style={styles.h3}>{c.count}</Text>
              </View>
              {i < categories.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))
        ) : (
          <Text style={styles.subtitle}>
            Your category mix will appear after you prepare an item.
          </Text>
        )}
      </Card>
      <Text style={styles.small}>
        SELLR does not calculate environmental impact in V1 because no
        defensible methodology is configured.
      </Text>
    </Screen>
  );
}
