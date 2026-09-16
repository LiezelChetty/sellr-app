import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";
import { Card, Header, Screen, styles } from "../src/components/ui";
import { COUNTRIES, getRegionalMarketplaces } from "../src/config/marketplaces";
import { useAppStore } from "../src/store/AppStore";
import { colors } from "../src/theme";
export default function Region() {
  const { preferences, setCountry } = useAppStore();
  return (
    <Screen>
      <Header
        title="Selling region"
        subtitle="Change this manually at any time. SELLR does not require precise device location."
      />
      {COUNTRIES.map((c) => (
        <Pressable key={c.code} onPress={() => setCountry(c.code)}>
          <Card
            style={[
              styles.between,
              preferences.countryCode === c.code && {
                borderColor: colors.green,
                borderWidth: 2,
              },
            ]}
          >
            <Text style={styles.h3}>{c.name}</Text>
            <Ionicons
              name={
                preferences.countryCode === c.code
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={25}
              color={colors.green}
            />
          </Card>
        </Pressable>
      ))}
      <Card>
        <Text style={styles.h3}>Available preparation</Text>
        <Text style={styles.body}>
          {getRegionalMarketplaces(preferences.countryCode)
            .map((m) => m.name)
            .join(" · ")}
        </Text>
      </Card>
    </Screen>
  );
}
