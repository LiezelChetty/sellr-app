import { Text } from "react-native";
import { Card, Header, Screen, styles } from "../src/components/ui";

export default function Help() {
  return (
    <Screen>
      <Header
        title="Help & policies"
        subtitle="What the current OfferMe development build does—and does not do."
      />
      <Card>
        <Text style={styles.h2}>Marketplace transactions</Text>
        <Text style={styles.body}>
          Buyers and sellers arrange payment and collection independently.
          OfferMe does not hold funds, verify handover or provide buyer
          protection.
        </Text>
      </Card>
      <Card>
        <Text style={styles.h2}>Privacy</Text>
        <Text style={styles.body}>
          Use only a broad town or city and region. Do not enter a street
          address or precise coordinates in listings or messages.
        </Text>
      </Card>
      <Card>
        <Text style={styles.h2}>Development build</Text>
        <Text style={styles.body}>
          Demo marketplace activity stays on this device. Public support,
          moderation and production legal policies must be connected before a
          public launch.
        </Text>
      </Card>
    </Screen>
  );
}
