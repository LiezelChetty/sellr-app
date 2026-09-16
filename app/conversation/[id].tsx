import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import {
  Button,
  DemoTag,
  Field,
  Header,
  Screen,
  styles,
} from "../../src/components/ui";
import { useAppStore } from "../../src/store/AppStore";
import { colors } from "../../src/theme";
export default function Conversation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversations, profiles, sendMessage, currentUserId, demoMode } = useAppStore();
  const [text, setText] = useState("");
  const c = conversations.find((x) => x.id === id);
  if (!c)
    return (
      <Screen>
        <Header title="Conversation not found" />
      </Screen>
    );
  const other = profiles.find(
    (p) => c.memberIds.includes(p.id) && p.id !== currentUserId,
  );
  return (
    <Screen>
      <Header
        title={other?.displayName ?? "Messages"}
        subtitle="Keep personal details private until you are comfortable."
      />
      {demoMode ? <DemoTag text="Messages stay on this device" /> : null}
      <View style={{ gap: 9 }}>
        {c.messages.length ? (
          c.messages.map((m) => {
            const mine = m.senderId === currentUserId;
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
        onPress={async () => {
          try { await sendMessage(c.id, text.trim()); setText(""); }
          catch (error) { Alert.alert("Could not send message", error instanceof Error ? error.message : "Try again."); }
        }}
      />
      <Text style={styles.small}>{demoMode ? "Demo messages remain on this device." : "Messages are visible only to conversation participants. Keep personal details private."}</Text>
    </Screen>
  );
}
