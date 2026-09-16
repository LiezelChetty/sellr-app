import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import {
  Card,
  DemoBanner,
  Header,
  Screen,
  styles,
  Wordmark,
} from "../../src/components/ui";
import { COUNTRIES } from "../../src/config/marketplaces";
import { useAppStore } from "../../src/store/AppStore";
import { colors } from "../../src/theme";
const staticRows = [
  ["notifications-outline", "Notifications"],
  ["shield-checkmark-outline", "Privacy"],
  ["document-text-outline", "Terms"],
  ["help-circle-outline", "Help"],
  ["information-circle-outline", "About SELLR"],
] as const;
export default function Profile() {
  const router = useRouter();
  const { preferences, resetDemo } = useAppStore();
  const row = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    onPress?: () => void,
    detail?: string,
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={[styles.between, { minHeight: 54 }]}
    >
      <View style={styles.row}>
        <Ionicons name={icon} size={22} color={colors.green} />
        <View>
          <Text style={styles.h3}>{label}</Text>
          {detail ? <Text style={styles.small}>{detail}</Text> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={19} color={colors.muted} />
    </Pressable>
  );
  return (
    <Screen>
      <Wordmark />
      <Header
        eyebrow="SETTINGS"
        title="Profile"
        subtitle="Manage your region, selling setup and plan."
      />
      <DemoBanner />
      <Card>
        {row("person-outline", "Profile", undefined, "Development profile")}
        <View style={styles.divider} />
        {row(
          "location-outline",
          "Selling Region",
          () => router.push("/region"),
          COUNTRIES.find((c) => c.code === preferences.countryCode)?.name,
        )}
        <View style={styles.divider} />
        {row(
          "link-outline",
          "Selling Accounts",
          () => router.push("/accounts"),
          "Official integrations only",
        )}
        <View style={styles.divider} />
        {row(
          "card-outline",
          "Plan / Credits",
          () => router.push("/plans"),
          "Free demo plan",
        )}
      </Card>
      <Card>
        {staticRows.map((r, i) => (
          <View key={r[1]}>
            {row(r[0], r[1], () =>
              Alert.alert(
                r[1],
                "This policy/settings destination is prepared for production content.",
              ),
            )}
            {i < staticRows.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </Card>
      <Card>
        {row("log-out-outline", "Sign Out", () =>
          Alert.alert("Demo mode", "Authentication is not configured yet."),
        )}
        <View style={styles.divider} />
        {row("refresh-outline", "Reset Demo", () =>
          Alert.alert(
            "Reset demo data?",
            "This removes local onboarding and listing data.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Reset", style: "destructive", onPress: resetDemo },
            ],
          ),
        )}
      </Card>
      <Text style={[styles.small, { textAlign: "center" }]}>
        SELLR by Designovation · V1 foundation
      </Text>
    </Screen>
  );
}
