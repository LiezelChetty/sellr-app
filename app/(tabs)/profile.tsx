import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import {
  Card,
  DemoTag,
  Header,
  Logo,
  Screen,
  styles,
} from "../../src/components/ui";
import { CURRENT_USER_ID } from "../../src/data/demo";
import { useAppStore } from "../../src/store/AppStore";
import { colors } from "../../src/theme";
export default function Profile() {
  const router = useRouter();
  const { preferences, profiles, listings, offers, favouriteIds, resetDemo } =
    useAppStore();
  const me = profiles.find((x) => x.id === CURRENT_USER_ID)!;
  const row = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    detail: string,
    onPress: () => void,
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={[styles.between, { minHeight: 52 }]}
    >
      <View style={styles.row}>
        <Ionicons name={icon} size={21} color={colors.greenDark} />
        <View>
          <Text style={styles.h3}>{label}</Text>
          <Text style={styles.small}>{detail}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
  return (
    <Screen>
      <Logo />
      <Header
        title={me.displayName}
        subtitle={`${preferences.town}, ${preferences.county} · Demo profile`}
      />
      <DemoTag />
      <Card>
        {row(
          "cube-outline",
          "My Listings",
          `${listings.filter((x) => x.sellerId === CURRENT_USER_ID).length} items`,
          () => router.push("/my-listings"),
        )}
        <View style={styles.divider} />
        {row(
          "storefront-outline",
          "My Sales",
          "Create and manage clear-outs",
          () => router.push("/my-sales"),
        )}
        <View style={styles.divider} />
        {row(
          "pricetag-outline",
          "Offers Received",
          `${offers.filter((x) => x.sellerId === CURRENT_USER_ID).length} offers`,
          () => router.push("/(tabs)/offers"),
        )}
        <View style={styles.divider} />
        {row(
          "paper-plane-outline",
          "Offers Sent",
          `${offers.filter((x) => x.buyerId === CURRENT_USER_ID).length} offers`,
          () => router.push("/(tabs)/offers"),
        )}
        <View style={styles.divider} />
        {row(
          "heart-outline",
          "Saved Items",
          `${favouriteIds.length} saved`,
          () => router.push("/saved"),
        )}
      </Card>
      <Card>
        {row(
          "location-outline",
          "Selling location",
          `${preferences.town}, ${preferences.county}`,
          () =>
            Alert.alert(
              "Approximate location",
              "Change location by resetting the demo and completing onboarding again.",
            ),
        )}
        <View style={styles.divider} />
        {row(
          "shield-checkmark-outline",
          "Safety",
          "Meeting and privacy guidance",
          () =>
            Alert.alert(
              "Stay safe",
              "Meet safely. Do not send money before you are comfortable with the transaction. Never share unnecessary personal information.",
            ),
        )}
        <View style={styles.divider} />
        {row(
          "help-circle-outline",
          "Help & policies",
          "Privacy, terms and support",
          () =>
            Alert.alert(
              "Production content required",
              "Public policies and support channels must be completed before launch.",
            ),
        )}
        <View style={styles.divider} />
        {row("refresh-outline", "Reset demo", "Clear local activity", () =>
          Alert.alert("Reset demo?", "This clears local OfferMe activity.", [
            { text: "Cancel", style: "cancel" },
            { text: "Reset", style: "destructive", onPress: resetDemo },
          ]),
        )}
      </Card>
      <Text style={[styles.small, { textAlign: "center" }]}>
        OfferMe connects buyers and sellers. Payment and collection are arranged
        independently.
      </Text>
    </Screen>
  );
}
