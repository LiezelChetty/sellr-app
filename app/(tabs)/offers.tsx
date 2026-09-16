import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import {
  Card,
  DemoTag,
  Empty,
  Header,
  money,
  Pill,
  Screen,
  styles,
} from "../../src/components/ui";
import { useAppStore } from "../../src/store/AppStore";
import { useState } from "react";
import { REGIONS } from "../../src/config/regions";
export default function Offers() {
  const router = useRouter();
  const { offers, listings, preferences, currentUserId, demoMode } = useAppStore();
  const symbol = REGIONS[preferences.countryCode].symbol;
  const [tab, setTab] = useState<"RECEIVED" | "SENT">("RECEIVED");
  const shown = offers.filter((o) =>
    tab === "RECEIVED"
      ? o.sellerId === currentUserId
      : o.buyerId === currentUserId,
  );
  return (
    <Screen>
      <Header
        title="Offers"
        subtitle="Negotiate locally, then arrange the transaction directly."
      />
      {demoMode ? <DemoTag text="Offers are local demo state" /> : null}
      <View style={styles.wrap}>
        <Pill
          label="Received"
          active={tab === "RECEIVED"}
          onPress={() => setTab("RECEIVED")}
        />
        <Pill
          label="Sent"
          active={tab === "SENT"}
          onPress={() => setTab("SENT")}
        />
      </View>
      {shown.length ? (
        shown.map((o) => {
          const l = listings.find((x) => x.id === o.listingIds[0]);
          return (
            <Pressable key={o.id} onPress={() => router.push(`/offer/${o.id}`)}>
              <Card>
                <View style={styles.between}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.h2}>
                      {money(symbol, o.amount)} offer
                    </Text>
                    <Text style={styles.body}>
                      {l?.title ?? "Bundle offer"}
                    </Text>
                    <Text style={styles.small}>{o.message}</Text>
                  </View>
                  <Text style={{ fontWeight: "900" }}>{o.status}</Text>
                </View>
              </Card>
            </Pressable>
          );
        })
      ) : (
        <Empty
          icon="pricetag-outline"
          title="No offers here"
          body="Offers you send or receive will appear here."
        />
      )}
    </Screen>
  );
}
