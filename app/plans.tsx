import { Alert, Text } from "react-native";
import { Button, Card, Header, Screen, styles } from "../src/components/ui";
import { PLANS } from "../src/config/plans";
export default function Plans() {
  return (
    <Screen>
      <Header
        eyebrow="PROVISIONAL PRICING"
        title="Plans & credits"
        subtitle="Choose the right size for a future clear-out. Live billing is not enabled in V1."
      />
      {PLANS.map((p, i) => (
        <Card key={p.id}>
          <Text style={styles.h3}>{p.name}</Text>
          <Text style={styles.h1}>{p.price}</Text>
          <Text style={styles.body}>{p.detail}</Text>
          <Button
            variant={i === 0 ? "secondary" : "primary"}
            label={i === 0 ? "Current demo plan" : "Unavailable in demo"}
            onPress={() =>
              Alert.alert(
                "Billing not enabled",
                "App Store and Google Play billing require production infrastructure and review.",
              )
            }
          />
        </Card>
      ))}
    </Screen>
  );
}
