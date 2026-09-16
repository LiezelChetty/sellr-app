import { Text } from "react-native";
import { Card, Header, Screen, styles } from "../src/components/ui";

const guidance = [
  [
    "Protect your privacy",
    "Keep your street address, precise location, passwords and payment details private. OfferMe only displays your configured broad area.",
  ],
  [
    "Meet safely",
    "Choose a busy public place when practical, tell someone where you are going and avoid meeting alone for high-value exchanges.",
  ],
  [
    "Check before paying",
    "Inspect the item and agree the price before exchanging money. OfferMe does not process payments or provide buyer protection.",
  ],
  [
    "Trust your judgement",
    "Stop the conversation if someone applies pressure, asks for unnecessary personal information or proposes an arrangement that feels unsafe.",
  ],
];

export default function Safety() {
  return (
    <Screen>
      <Header
        title="Buy and sell safely"
        subtitle="Practical guidance for local conversations and handovers."
      />
      {guidance.map(([title, body]) => (
        <Card key={title}>
          <Text style={styles.h2}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </Card>
      ))}
      <Text style={styles.small}>
        If you or someone else is in immediate danger, contact your local
        emergency services.
      </Text>
    </Screen>
  );
}
