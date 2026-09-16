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
export default function OfferDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { offers, listings, updateOffer, startConversation } = useAppStore();
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
        title={`${money("€", offer.amount)} for ${listing?.title ?? "items"}`}
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
          Asking price {listing ? money("€", listing.askingPrice) : "—"}
        </Text>
      </Card>
      {offer.status === "PENDING" || offer.status === "COUNTERED" ? (
        <>
          <Button
            label={
              received
                ? `ACCEPT ${money("€", offer.amount)}`
                : `ACCEPT ${money("€", offer.amount)}`
            }
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
