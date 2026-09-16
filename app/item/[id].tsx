import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Modal, Pressable, Text, View } from "react-native";
import {
  Button,
  Card,
  DemoBanner,
  Field,
  Header,
  money,
  Screen,
  styles,
} from "../../src/components/ui";
import { MARKETPLACES, REGIONS } from "../../src/config/marketplaces";
import { useAppStore } from "../../src/store/AppStore";
import { MarketplaceListing } from "../../src/types/domain";
import { colors } from "../../src/theme";

export default function ItemDetail() {
  const { id, created } = useLocalSearchParams<{
    id: string;
    created?: string;
  }>();
  const router = useRouter();
  const { listings, preferences, updateMarketplaceListing, markSold } =
    useAppStore();
  const item = listings.find((x) => x.id === id);
  const [editing, setEditing] = useState<MarketplaceListing | null>(null);
  const [sellOpen, setSellOpen] = useState(false);
  const [soldMarket, setSoldMarket] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [notes, setNotes] = useState("");
  if (!item)
    return (
      <Screen>
        <Header title="Item not found" />
        <Button
          label="Back to My Items"
          onPress={() => router.replace("/(tabs)/items")}
        />
      </Screen>
    );
  const symbol = REGIONS[preferences.countryCode].symbol;
  const copyOpen = async (m: MarketplaceListing) => {
    const market = MARKETPLACES[m.marketplaceId];
    await Clipboard.setStringAsync(
      `${m.title}\n\n${m.description}\n\n${symbol}${m.price}\n\n${m.tags.map((t) => `#${t.replace(/\s/g, "")}`).join(" ")}`,
    );
    Alert.alert(
      "Listing copied",
      `${market.name} draft copied. SELLR has not published it.`,
      [
        { text: "Stay here" },
        {
          text: `Open ${market.name}`,
          onPress: () =>
            market.handoffUrl && Linking.openURL(market.handoffUrl),
        },
      ],
    );
  };
  const live = item.marketplaceListings.filter((m) => m.status === "LIVE");
  const completeSale = () => {
    if (!soldMarket || !Number(salePrice))
      return Alert.alert(
        "Add sale details",
        "Choose where it sold and enter the sale price.",
      );
    markSold(item.id, soldMarket, Number(salePrice), notes);
    setSellOpen(false);
    const remaining = live.filter((m) => m.marketplaceId !== soldMarket);
    Alert.alert(
      "Sold 🎉",
      remaining.length
        ? `This item may still be listed on:\n\n${remaining.map((m) => MARKETPLACES[m.marketplaceId].name).join("\n")}\n\nSELLR has not removed those listings.`
        : "Sale recorded in SELLR.",
    );
  };
  return (
    <Screen>
      {created ? (
        <Card style={{ backgroundColor: colors.greenSoft }}>
          <Text style={styles.h2}>Drafts ready</Text>
          <Text style={styles.body}>
            Your master listing and marketplace versions were saved. Nothing has
            been published.
          </Text>
        </Card>
      ) : null}
      <DemoBanner />
      <Header
        eyebrow={item.soldAt ? "SOLD" : "MASTER LISTING"}
        title={item.title}
        subtitle={`${item.brand} · ${item.size} · ${item.condition}`}
      />
      <View style={styles.wrap}>
        {item.photos.map((uri) => (
          <Image
            key={uri}
            source={{ uri }}
            style={{ width: 112, height: 112, borderRadius: 17 }}
          />
        ))}
      </View>
      <Card>
        <View style={styles.between}>
          <Text style={styles.h2}>
            {money(symbol, item.salePrice ?? item.recommendedPrice)}
          </Text>
          <Text
            style={{
              fontWeight: "900",
              color: item.soldAt ? colors.accent : colors.success,
            }}
          >
            {item.soldAt ? "SOLD" : "MASTER"}
          </Text>
        </View>
        <Text style={styles.body}>{item.description}</Text>
        <View style={styles.divider} />
        <Text style={styles.small}>
          {item.category} · {item.subcategory} · {item.colour}
        </Text>
        <Text style={styles.small}>
          Suggested range {money(symbol, item.suggestedPriceLow)}–
          {money(symbol, item.suggestedPriceHigh)} · guidance only
        </Text>
      </Card>
      <Text style={styles.h2}>Marketplace status</Text>
      {item.marketplaceListings.map((m) => {
        const market = MARKETPLACES[m.marketplaceId];
        return (
          <Card key={m.id}>
            <View style={styles.between}>
              <View>
                <Text style={styles.h2}>{market.name}</Text>
                <Text
                  style={{
                    fontWeight: "900",
                    color:
                      m.status === "LIVE" ? colors.success : colors.warning,
                  }}
                >
                  {m.status}
                </Text>
              </View>
              <Ionicons
                name={
                  m.status === "LIVE"
                    ? "radio-outline"
                    : "document-text-outline"
                }
                size={27}
                color={colors.green}
              />
            </View>
            <Text style={styles.small}>
              {market.capabilities.includes("OAUTH_AVAILABLE")
                ? "Official connection architecture; not connected"
                : "Preparation / handoff only"}
            </Text>
            <View style={styles.wrap}>
              <Button
                label="View / Edit"
                variant="secondary"
                onPress={() => setEditing({ ...m })}
              />
              <Button
                label={
                  market.capabilities.includes("OAUTH_AVAILABLE")
                    ? "Copy listing"
                    : "Copy & Open"
                }
                variant="ghost"
                onPress={() => copyOpen(m)}
              />
            </View>
            {m.status !== "LIVE" && !item.soldAt ? (
              <Button
                label="Mark as Listed"
                onPress={() =>
                  updateMarketplaceListing(item.id, m.marketplaceId, {
                    status: "LIVE",
                  })
                }
              />
            ) : null}
            {m.status === "LIVE" && !item.soldAt ? (
              <Button
                label="Mark not live"
                variant="ghost"
                onPress={() =>
                  updateMarketplaceListing(item.id, m.marketplaceId, {
                    status: "READY",
                  })
                }
              />
            ) : null}
          </Card>
        );
      })}
      {!item.soldAt ? (
        <Button
          label="Mark item as sold"
          icon="checkmark-circle-outline"
          onPress={() => {
            setSoldMarket(item.marketplaceListings[0]?.marketplaceId ?? "");
            setSalePrice(String(item.recommendedPrice));
            setSellOpen(true);
          }}
        />
      ) : null}
      <Button
        label="Back to My Items"
        variant="ghost"
        onPress={() => router.replace("/(tabs)/items")}
      />
      <Modal
        visible={!!editing}
        animationType="slide"
        onRequestClose={() => setEditing(null)}
      >
        {editing ? (
          <Screen>
            <Header
              eyebrow={MARKETPLACES[editing.marketplaceId].name.toUpperCase()}
              title="Edit marketplace draft"
              subtitle="Changes here do not alter the Master Listing."
            />
            <Field
              label="Title"
              value={editing.title}
              onChangeText={(title) => setEditing({ ...editing, title })}
            />
            <Field
              label="Description"
              multiline
              value={editing.description}
              onChangeText={(description) =>
                setEditing({ ...editing, description })
              }
            />
            <Field
              label="Price"
              keyboardType="numeric"
              value={String(editing.price)}
              onChangeText={(price) =>
                setEditing({ ...editing, price: Number(price) || 0 })
              }
            />
            <Field
              label="Category"
              value={editing.category}
              onChangeText={(category) => setEditing({ ...editing, category })}
            />
            <Field
              label="Marketplace notes"
              multiline
              value={editing.marketplaceNotes}
              onChangeText={(marketplaceNotes) =>
                setEditing({ ...editing, marketplaceNotes })
              }
            />
            <Button
              label="Save draft"
              onPress={() => {
                updateMarketplaceListing(
                  item.id,
                  editing.marketplaceId,
                  editing,
                );
                setEditing(null);
              }}
            />
            <Button
              label="Cancel"
              variant="ghost"
              onPress={() => setEditing(null)}
            />
          </Screen>
        ) : null}
      </Modal>
      <Modal
        visible={sellOpen}
        animationType="slide"
        onRequestClose={() => setSellOpen(false)}
      >
        <Screen>
          <Header
            title="Where did it sell?"
            subtitle="Record the sale manually. SELLR will never claim to delist elsewhere."
          />
          {item.marketplaceListings.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => setSoldMarket(m.marketplaceId)}
            >
              <Card
                style={[
                  styles.between,
                  soldMarket === m.marketplaceId && {
                    borderColor: colors.green,
                    borderWidth: 2,
                  },
                ]}
              >
                <Text style={styles.h3}>
                  {MARKETPLACES[m.marketplaceId].name}
                </Text>
                <Ionicons
                  name={
                    soldMarket === m.marketplaceId
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={24}
                  color={colors.green}
                />
              </Card>
            </Pressable>
          ))}
          <Field
            label="Sale Price"
            keyboardType="numeric"
            value={salePrice}
            onChangeText={setSalePrice}
          />
          <Field
            label="Optional Notes"
            multiline
            value={notes}
            onChangeText={setNotes}
          />
          <Button label="Record sale" onPress={completeSale} />
          <Button
            label="Cancel"
            variant="ghost"
            onPress={() => setSellOpen(false)}
          />
        </Screen>
      </Modal>
    </Screen>
  );
}
