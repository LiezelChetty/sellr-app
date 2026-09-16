import { Alert, Text, View } from "react-native";
import {
  Button,
  Card,
  DemoBanner,
  Header,
  Screen,
  styles,
} from "../src/components/ui";
import { getRegionalMarketplaces } from "../src/config/marketplaces";
import { useAppStore } from "../src/store/AppStore";
export default function Accounts() {
  const { preferences } = useAppStore();
  return (
    <Screen>
      <Header
        eyebrow="OFFICIAL ACCESS ONLY"
        title="Selling accounts"
        subtitle="Connection surfaces are architectural placeholders until authorised APIs and secure server-side OAuth are implemented."
      />
      <DemoBanner />
      {getRegionalMarketplaces(preferences.countryCode).map((m) => (
        <Card key={m.id}>
          <View style={styles.between}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.h2}>{m.name}</Text>
              <Text style={styles.body}>
                {m.capabilities.includes("OAUTH_AVAILABLE")
                  ? "Account connection architecture available"
                  : "Listing preparation / handoff available"}
              </Text>
              <Text style={styles.small}>
                Status: NOT CONNECTED · DEVELOPMENT
              </Text>
            </View>
          </View>
          <Button
            variant="secondary"
            label={
              m.capabilities.includes("OAUTH_AVAILABLE")
                ? "Connect (not implemented)"
                : "Set Up"
            }
            onPress={() =>
              Alert.alert(
                "Development architecture only",
                `${m.name} is not connected. SELLR never asks for your marketplace password.`,
              )
            }
          />
        </Card>
      ))}
      <Text style={styles.small}>
        OAuth tokens must be handled by a secure backend and never committed or
        unnecessarily exposed to the mobile client.
      </Text>
    </Screen>
  );
}
