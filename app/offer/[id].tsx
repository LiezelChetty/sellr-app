import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import {
  Button,
  Card,
  DemoTag,
  Field,
  Header,
  money,
  Screen,
  styles,
} from "../../src/components/ui";
import { CURRENT_USER_ID } from "../../src/data/demo";
import { useAppStore } from "../../src/store/AppStore";
import { colors } from "../../src/theme";
import { REGIONS } from "../../src/config/regions";
export default function OfferDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { offers, listings, preferences, updateOffer, startConversation } =
    useAppStore();
  const offer = offers.find((x) => x.id === id);
  const [counter, setCounter] = useState("");
  if (!offer)
    return (
      <Screen>
        <Header title="Offer not found" />
      </Screen>
    );
  const listing = listings.find((x) => x.id === offer.listingIds[0]);
  const received = offer.sellerId === CURRENT_USER_ID;
  const canRespond = received || offer.status === "COUNTERED";
  const symbol = REGIONS[preferences.countryCode].symbol;
  const respond = (status: "ACCEPTED" | "DECLINED") => {
    updateOffer(offer.id, status);
    if (status === "ACCEPTED")
      Alert.alert(
        "Offer accepted!",
        "Message the other person to arrange payment and collection or delivery directly. OfferMe has not completed a transaction.",
      );
  };
  return (
    <Screen>
      <Header
        eyebrow={received ? "OFFER RECEIVED" : "OFFER SENT"}
        title={`${money(symbol, offer.amount)} for ${listing?.title ?? "items"}`}
        subtitle={offer.message || "No message"}
      />
      <DemoTag text="Local demo negotiation" />
      <Card>
        <View style={styles.between}>
          <Text style={styles.h2}>Status</Text>
          <Text
            style={{
              fontWeight: "900",
              color: offer.status === "ACCEPTED" ? colors.success : colors.ink,
            }}
          >
            {offer.status}
          </Text>
        </View>
        <Text style={styles.small}>
          Asking price {listing ? money(symbol, listing.askingPrice) : "—"}
        </Text>
      </Card>
      {(offer.status === "PENDING" || offer.status === "COUNTERED") &&
      canRespond ? (
        <>
          <Button
            label={`ACCEPT ${money(symbol, offer.amount)}`}
            onPress={() => respond("ACCEPTED")}
          />
          <Field
            label="Counter amount"
            keyboardType="numeric"
            value={counter}
            onChangeText={setCounter}
            placeholder="Enter a fair counter offer"
          />
          <Button
            label="COUNTER"
            variant="secondary"
            disabled={!Number(counter)}
            onPress={() => {
              updateOffer(offer.id, "COUNTERED", Number(counter));
              setCounter("");
            }}
          />
          <Button
            label="DECLINE"
            variant="danger"
            onPress={() => respond("DECLINED")}
          />
        </>
      ) : null}
      {offer.status === "PENDING" && !received ? (
        <Card>
          <Text style={styles.h2}>Waiting for the seller</Text>
          <Text style={styles.body}>
            You can message the seller while they consider your offer.
          </Text>
        </Card>
      ) : null}
      {offer.status === "ACCEPTED" ? (
        <Card style={{ backgroundColor: colors.greenSoft }}>
          <Text style={styles.h2}>Offer accepted!</Text>
          <Text style={styles.body}>
            Arrange payment and collection or delivery directly with the seller.
          </Text>
        </Card>
      ) : null}
      {listing ? (
        <Button
          label="Message"
          icon="chatbubble-outline"
          variant="ghost"
          onPress={() =>
            router.push(`/conversation/${startConversation(listing.id)}`)
          }
        />
      ) : null}
      <Text style={styles.small}>
        An accepted offer is an agreement to continue the conversation. OfferMe
        does not process payment, verify handover, or provide buyer protection.
      </Text>
    </Screen>
  );
}
