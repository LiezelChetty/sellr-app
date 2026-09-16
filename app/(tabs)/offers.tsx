import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { CURRENT_USER_ID } from "../../src/data/demo";
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
export default function Offers() {
  const router = useRouter();
  const { offers, listings } = useAppStore();
  const [tab, setTab] = useState<"RECEIVED" | "SENT">("RECEIVED");
  const shown = offers.filter((o) =>
    tab === "RECEIVED"
      ? o.sellerId === CURRENT_USER_ID
      : o.buyerId === CURRENT_USER_ID,
  );
  return (
    <Screen>
      <Header
        title="Offers"
        subtitle="Negotiate locally, then arrange the transaction directly."
      />
      <DemoTag text="Offers are local demo state" />
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
                    <Text style={styles.h2}>{money("€", o.amount)} offer</Text>
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
