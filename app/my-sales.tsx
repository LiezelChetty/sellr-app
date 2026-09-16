import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import {
  Button,
  Card,
  DemoTag,
  Field,
  Header,
  Pill,
  Screen,
  styles,
} from "../src/components/ui";
import { CURRENT_USER_ID } from "../src/data/demo";
import { useAppStore } from "../src/store/AppStore";
export default function MySales() {
  const router = useRouter();
  const { sales, listings, addSale } = useAppStore();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("My Clear-Out");
  const [description, setDescription] = useState(
    "Useful things ready for a new home.",
  );
  const [selected, setSelected] = useState<string[]>([]);
  const mine = sales.filter((x) => x.sellerId === CURRENT_USER_ID);
  const available = listings.filter(
    (x) => x.sellerId === CURRENT_USER_ID && x.status === "LIVE",
  );
  return (
    <Screen>
      <Header
        title="My Sales"
        subtitle="Group listings so buyers can browse your whole clear-out together."
      />
      <DemoTag text="Development preview · saved on this device" />
      {creating ? (
        <Card>
          <Field label="Sale title" value={title} onChangeText={setTitle} />
          <Field
            label="Description"
            multiline
            value={description}
            onChangeText={setDescription}
          />
          <Text style={styles.h3}>Choose listings</Text>
          {available.map((l) => (
            <Pill
              key={l.id}
              label={`${selected.includes(l.id) ? "✓ " : ""}${l.title}`}
              active={selected.includes(l.id)}
              onPress={() =>
                setSelected((x) =>
                  x.includes(l.id) ? x.filter((v) => v !== l.id) : [...x, l.id],
                )
              }
            />
          ))}
          <Button
            label="Publish garage sale"
            disabled={!title || !selected.length}
            onPress={() => {
              const id = addSale(title, description, selected);
              setCreating(false);
              router.push(`/sale/${id}`);
            }}
          />
          <Button
            label="Cancel"
            variant="ghost"
            onPress={() => setCreating(false)}
          />
        </Card>
      ) : (
        <Button
          label="Create a garage sale"
          icon="storefront-outline"
          onPress={() => setCreating(true)}
        />
      )}
      {mine.map((s) => (
        <Pressable key={s.id} onPress={() => router.push(`/sale/${s.id}`)}>
          <Card>
            <Text style={styles.h2}>{s.title}</Text>
            <Text style={styles.body}>
              {s.itemCount} items · {s.status}
            </Text>
            <Text style={styles.small}>{s.approximateLocation}</Text>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}
