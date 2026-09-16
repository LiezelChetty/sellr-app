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
import { formatApproximateLocation } from "../../src/config/regions";
import { useAppStore } from "../../src/store/AppStore";
import { colors } from "../../src/theme";
import { useAuth } from "../../src/store/AuthStore";
export default function Profile() {
  const router = useRouter();
  const { preferences, profiles, listings, offers, favouriteIds, resetDemo, currentUserId, demoMode } =
    useAppStore();
  const auth = useAuth();
  const me = profiles.find((x) => x.id === currentUserId) ?? auth.profile ?? { id: currentUserId, displayName: "OfferMe member", approximateLocation: "Area not set", memberSince: new Date().toISOString() };
  const broadLocation = formatApproximateLocation(
    preferences.countryCode,
    preferences.region,
    preferences.town,
  );
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
        subtitle={`${broadLocation}${demoMode ? " · Demo profile" : ""}`}
      />
      {demoMode ? <DemoTag /> : null}
      <Card>
        {row(
          "cube-outline",
          "My Listings",
          `${listings.filter((x) => x.sellerId === currentUserId).length} items`,
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
          `${offers.filter((x) => x.sellerId === currentUserId).length} offers`,
          () => router.push("/(tabs)/offers"),
        )}
        <View style={styles.divider} />
        {row(
          "paper-plane-outline",
          "Offers Sent",
          `${offers.filter((x) => x.buyerId === currentUserId).length} offers`,
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
        {row("location-outline", "Selling location", broadLocation, () =>
          router.push("/location"),
        )}
        <View style={styles.divider} />
        {row(
          "shield-checkmark-outline",
          "Safety",
          "Meeting and privacy guidance",
          () => router.push("/safety"),
        )}
        <View style={styles.divider} />
        {row(
          "help-circle-outline",
          "Help & policies",
          "Privacy, terms and support",
          () => router.push("/help"),
        )}
        <View style={styles.divider} />
        {demoMode ? row("refresh-outline", "Reset demo", "Clear local activity", () => Alert.alert("Reset demo?", "This clears local OfferMe activity.", [{ text: "Cancel", style: "cancel" }, { text: "Reset", style: "destructive", onPress: resetDemo }])) : row("log-out-outline", "Log out", "Sign out of this device", () => Alert.alert("Log out?", "You can log back in with your email and password.", [{ text: "Cancel", style: "cancel" }, { text: "Log out", style: "destructive", onPress: () => auth.signOut() }]))}
      </Card>
      <Text style={[styles.small, { textAlign: "center" }]}>
        OfferMe connects buyers and sellers. Payment and collection are arranged
        independently.
      </Text>
    </Screen>
  );
}
