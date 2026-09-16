import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import {
  Button,
  DemoTag,
  Field,
  Header,
  Screen,
  styles,
} from "../../src/components/ui";
import { CURRENT_USER_ID } from "../../src/data/demo";
import { useAppStore } from "../../src/store/AppStore";
import { colors } from "../../src/theme";
export default function Conversation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversations, profiles, sendMessage } = useAppStore();
  const [text, setText] = useState("");
  const c = conversations.find((x) => x.id === id);
  if (!c)
    return (
      <Screen>
        <Header title="Conversation not found" />
      </Screen>
    );
  const other = profiles.find(
    (p) => c.memberIds.includes(p.id) && p.id !== CURRENT_USER_ID,
  );
  return (
    <Screen>
      <Header
        title={other?.displayName ?? "Messages"}
        subtitle="Keep personal details private until you are comfortable."
      />
      <DemoTag text="Messages stay on this device" />
      <View style={{ gap: 9 }}>
        {c.messages.length ? (
          c.messages.map((m) => {
            const mine = m.senderId === CURRENT_USER_ID;
            return (
              <View
                key={m.id}
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                  backgroundColor: mine ? colors.greenDark : colors.surface,
                  padding: 12,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={[
                    styles.body,
                    { color: mine ? colors.white : colors.ink },
                  ]}
                >
                  {m.body}
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.subtitle}>
            Start the conversation with a question about the item.
          </Text>
        )}
      </View>
      <Field
        label="Message"
        multiline
        value={text}
        onChangeText={setText}
        placeholder="Write a message"
      />
      <Button
        label="Send message"
        disabled={!text.trim()}
        onPress={() => {
          sendMessage(c.id, text.trim());
          setText("");
        }}
      />
      <Text style={styles.small}>
        No message is sent to a real person. Production messaging requires
        authenticated, private realtime storage and moderation.
      </Text>
    </Screen>
  );
}
