import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  Share,
  Text,
  View,
} from "react-native";
import {
  Button,
  Card,
  DemoTag,
  Field,
  Header,
  ListingCard,
  money,
  Screen,
  styles,
} from "../../src/components/ui";
import { REGIONS } from "../../src/config/regions";
import { useAppStore } from "../../src/store/AppStore";
import { colors } from "../../src/theme";
export default function Item() {
  const { id, created } = useLocalSearchParams<{
    id: string;
    created?: string;
  }>();
  const router = useRouter();
  const {
    listings,
    profiles,
    preferences,
    favouriteIds,
    toggleFavourite,
    createOffer,
    startConversation,
    markSold,
    reportListing,
    currentUserId,
    demoMode,
  } = useAppStore();
  const listing = listings.find((x) => x.id === id);
  const [offerOpen, setOfferOpen] = useState(false);
  const [soldOpen, setSoldOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  if (!listing)
    return (
      <Screen>
        <Header title="Listing not found" />
      </Screen>
    );
  const seller = profiles.find((x) => x.id === listing.sellerId)!;
  const symbol = REGIONS[preferences.countryCode].symbol;
  const mine = listing.sellerId === currentUserId;
  const others = listings
    .filter(
      (x) =>
        x.sellerId === listing.sellerId &&
        x.id !== listing.id &&
        x.status === "LIVE",
    )
    .slice(0, 2);
  const sendOffer = async () => {
    if (!Number(amount))
      return Alert.alert(
        "Enter an offer",
        "Add the amount you would like to offer.",
      );
    try {
      const offerId = await createOffer(listing.id, Number(amount), message);
      setOfferOpen(false);
      router.push(`/offer/${offerId}`);
    } catch (error) {
      Alert.alert(
        "Could not send offer",
        error instanceof Error ? error.message : "Try again.",
      );
    }
  };
  const showShareError = () =>
    Alert.alert("Sharing unavailable", "Please try sharing again.");
  const shareListing = async () => {
    try {
      await Share.share({
        title: `${listing.title} on OfferMe`,
        message: [
          `${listing.title} — ${money(symbol, listing.askingPrice)}`,
          `${listing.approximateLocation} (approximate area)`,
          listing.description,
          "Shared from OfferMe. Contact and collection are arranged directly in the app.",
        ].join("\n\n"),
      });
    } catch {
      showShareError();
    }
  };
  return (
    <Screen>
      {created ? (
        <View
          style={{
            padding: 12,
            borderRadius: 14,
            backgroundColor: colors.greenSoft,
          }}
        >
          <Text style={styles.h3}>
            {demoMode
              ? "Your listing is live locally in this demo."
              : "Your listing is live."}
          </Text>
        </View>
      ) : null}
      {listing.isDemo ? (
        <DemoTag text="Development listing — not a real seller" />
      ) : null}
      <View style={styles.wrap}>
        {listing.photos.map((uri) => (
          <Image
            key={uri}
            source={{ uri }}
            style={{ width: "100%", height: 300, borderRadius: 18 }}
          />
        ))}
      </View>
      <View style={styles.between}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={styles.h1}>{listing.title}</Text>
          <Text style={{ fontSize: 28, fontWeight: "900" }}>
            {money(symbol, listing.askingPrice)}
          </Text>
          <Text style={styles.subtitle}>
            {listing.approximateLocation} · Approximate area
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Save item"
          onPress={() => toggleFavourite(listing.id)}
        >
          <Ionicons
            name={favouriteIds.includes(listing.id) ? "heart" : "heart-outline"}
            size={30}
            color={
              favouriteIds.includes(listing.id) ? colors.danger : colors.ink
            }
          />
        </Pressable>
      </View>
      <View style={styles.card}>
        <Text style={styles.h2}>Details</Text>
        <Text style={styles.body}>
          {listing.condition} · {listing.category}
        </Text>
        <Text style={styles.body}>{listing.description}</Text>
      </View>
      <Pressable
        onPress={() => router.push(`/seller/${seller.id}`)}
        style={[styles.card, styles.between]}
      >
        <View>
          <Text style={styles.h2}>{seller.displayName}</Text>
          <Text style={styles.small}>
            {seller.approximateLocation} · Member since{" "}
            {new Date(seller.memberSince).getFullYear()}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} />
      </Pressable>
      {mine ? (
        <>
          <Button
            label={listing.status === "SOLD" ? "Marked sold" : "Mark item sold"}
            disabled={listing.status === "SOLD"}
            onPress={() => setSoldOpen(true)}
          />
        </>
      ) : (
        <>
          <Button
            label="MAKE AN OFFER"
            icon="pricetag-outline"
            onPress={() => {
              setAmount(String(Math.max(1, listing.askingPrice - 5)));
              setOfferOpen(true);
            }}
          />
          <Button
            label="MESSAGE SELLER"
            icon="chatbubble-outline"
            variant="secondary"
            onPress={async () => {
              try {
                router.push(
                  `/conversation/${await startConversation(listing.id)}`,
                );
              } catch (error) {
                Alert.alert(
                  "Could not start conversation",
                  error instanceof Error ? error.message : "Try again.",
                );
              }
            }}
          />
        </>
      )}
      <View style={styles.row}>
        <Button label="Share" variant="ghost" onPress={shareListing} />
        <Button
          label={demoMode ? "Reporting unavailable in demo" : "Report listing"}
          variant="ghost"
          disabled={demoMode || mine}
          onPress={() => setReportOpen(true)}
        />
      </View>
      <View
        style={{
          padding: 13,
          borderRadius: 14,
          backgroundColor: "#FFF4CB",
          gap: 4,
        }}
      >
        <Text style={styles.h3}>A safe local handover</Text>
        <Text style={styles.small}>
          Meet safely. Do not send money before you are comfortable with the
          transaction. Never share unnecessary personal information.
        </Text>
      </View>
      {others.length ? (
        <>
          <Text style={styles.h2}>Other items from this seller</Text>
          <View style={styles.wrap}>
            {others.map((l) => (
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
        </>
      ) : null}
      <Modal
        visible={offerOpen}
        animationType="slide"
        onRequestClose={() => setOfferOpen(false)}
      >
        <Screen>
          <Header
            title={`Make an offer on ${listing.title}`}
            subtitle={`Asking price ${money(symbol, listing.askingPrice)}`}
          />
          {demoMode ? <DemoTag text="Offer stays on this device" /> : null}
          <Field
            label="Your offer"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Field
            label="Optional message"
            multiline
            value={message}
            onChangeText={setMessage}
            placeholder="Keep it friendly"
          />
          <Button label="Send Offer" onPress={sendOffer} />
          <Button
            label="Cancel"
            variant="ghost"
            onPress={() => setOfferOpen(false)}
          />
          <Text style={styles.small}>
            Sending an offer does not pay for or reserve the item.
          </Text>
        </Screen>
      </Modal>
      <Modal
        visible={soldOpen}
        animationType="slide"
        onRequestClose={() => setSoldOpen(false)}
      >
        <Screen>
          <Header
            title="Mark this item as sold?"
            subtitle="Only do this when you decide the item is no longer available."
          />
          <Card style={{ backgroundColor: colors.greenSoft }}>
            <Text style={styles.h2}>{listing.title}</Text>
            <Text style={styles.body}>
              OfferMe does not know whether payment or handover occurred. This
              action only changes availability in your listings.
            </Text>
          </Card>
          <Button
            label="Confirm sold"
            onPress={async () => {
              try {
                await markSold(listing.id);
                setSoldOpen(false);
              } catch (error) {
                Alert.alert(
                  "Could not update listing",
                  error instanceof Error ? error.message : "Try again.",
                );
              }
            }}
          />
          <Button
            label="Cancel"
            variant="ghost"
            onPress={() => setSoldOpen(false)}
          />
        </Screen>
      </Modal>
      <Modal
        visible={reportOpen}
        animationType="slide"
        onRequestClose={() => setReportOpen(false)}
      >
        <Screen>
          <Header
            title="Report this listing"
            subtitle="Tell OfferMe what appears unsafe or inappropriate. Do not include private information."
          />
          <Field
            label="Reason"
            multiline
            value={reportReason}
            onChangeText={setReportReason}
          />
          <Button
            label="Submit report"
            disabled={reportReason.trim().length < 10}
            onPress={async () => {
              try {
                await reportListing(listing.id, reportReason.trim());
                setReportOpen(false);
                setReportReason("");
                Alert.alert(
                  "Report submitted",
                  "Thank you. The report is recorded for review.",
                );
              } catch (error) {
                Alert.alert(
                  "Could not submit report",
                  error instanceof Error ? error.message : "Try again.",
                );
              }
            }}
          />
          <Button
            label="Cancel"
            variant="ghost"
            onPress={() => setReportOpen(false)}
          />
        </Screen>
      </Modal>
    </Screen>
  );
}
