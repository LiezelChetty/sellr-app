import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import {
  Card,
  DemoBanner,
  Empty,
  Header,
  money,
  Pill,
  Screen,
  styles,
} from "../../src/components/ui";
import { MARKETPLACES, REGIONS } from "../../src/config/marketplaces";
import { useAppStore } from "../../src/store/AppStore";
import { ListingStatus } from "../../src/types/domain";
import { colors } from "../../src/theme";

const tabs = ["ALL", "DRAFT", "READY", "LIVE", "SOLD"] as const;
export default function Items() {
  const router = useRouter();
  const { listings, preferences } = useAppStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("ALL");
  const symbol = REGIONS[preferences.countryCode].symbol;
  const shown = listings.filter(
    (i) =>
      tab === "ALL" ||
      (tab === "SOLD"
        ? !!i.soldAt
        : i.marketplaceListings.some(
            (m) => m.status === (tab as ListingStatus),
          )),
  );
  return (
    <Screen>
      <Header
        eyebrow="YOUR INVENTORY"
        title="My Items"
        subtitle="One master listing, with marketplace-specific versions."
      />
      <DemoBanner />
      <View style={styles.wrap}>
        {tabs.map((t) => (
          <Pill
            key={t}
            label={t === "DRAFT" ? "DRAFTS" : t}
            active={tab === t}
            onPress={() => setTab(t)}
          />
        ))}
      </View>
      {!shown.length ? (
        <Empty
          title={listings.length ? "No items in this view" : "No items yet"}
          body={
            listings.length
              ? "Try another status filter."
              : "Prepare your first item from the Sell tab."
          }
        />
      ) : (
        shown.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(`/item/${item.id}`)}
          >
            <Card style={styles.row}>
              {item.photos[0] ? (
                <Image
                  source={{ uri: item.photos[0] }}
                  style={{ width: 72, height: 72, borderRadius: 15 }}
                />
              ) : (
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 15,
                    backgroundColor: colors.greenSoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="image-outline"
                    size={28}
                    color={colors.green}
                  />
                </View>
              )}
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.h3}>{item.title}</Text>
                <Text style={styles.h2}>
                  {money(symbol, item.salePrice ?? item.recommendedPrice)}
                </Text>
                <Text style={styles.small}>
                  {item.marketplaceListings
                    .map((m) => MARKETPLACES[m.marketplaceId].name)
                    .join(" · ")}
                </Text>
                <Text
                  style={{
                    color: item.soldAt ? colors.accent : colors.success,
                    fontWeight: "800",
                    fontSize: 12,
                  }}
                >
                  {item.soldAt
                    ? "SOLD"
                    : item.marketplaceListings.some((m) => m.status === "LIVE")
                      ? "LIVE"
                      : "READY"}
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
