import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Button,
  Header,
  Pill,
  Screen,
  styles,
  Wordmark,
} from "../src/components/ui";
import { COUNTRIES } from "../src/config/marketplaces";
import { useAppStore } from "../src/store/AppStore";
import { CountryCode } from "../src/types/domain";
import { colors } from "../src/theme";

const categories = [
  "Wardrobe",
  "Kids’ Stuff",
  "Home",
  "Electronics",
  "Everything",
];
export default function Onboarding() {
  const router = useRouter();
  const { completeOnboarding } = useAppStore();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [country, setCountry] = useState<CountryCode>("IE");
  const toggle = (x: string) =>
    setSelected((s) => (s.includes(x) ? s.filter((v) => v !== x) : [...s, x]));
  return (
    <Screen>
      <View
        style={{ flex: 1, justifyContent: "space-between", minHeight: 620 }}
      >
        <View style={{ gap: 24 }}>
          <View style={styles.between}>
            <Wordmark />
            <Text style={styles.small}>{step + 1} / 3</Text>
          </View>
          {step === 0 && (
            <View style={{ gap: 18, paddingTop: 75 }}>
              <View
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 22,
                  backgroundColor: colors.greenSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="layers-outline"
                  size={30}
                  color={colors.green}
                />
              </View>
              <Header
                eyebrow="ONE PHOTO. ONE MASTER LISTING."
                title="One item. Every marketplace."
                subtitle={
                  "Photograph your item once.\nSELLR helps prepare it for the places you sell."
                }
              />
              <Text style={styles.small}>Better listings. Honest photos.</Text>
            </View>
          )}
          {step === 1 && (
            <View style={{ gap: 20, paddingTop: 30 }}>
              <Header
                title="What do you want to clear out?"
                subtitle="Choose as many as you like. You can change this later."
              />
              <View style={styles.wrap}>
                {categories.map((x) => (
                  <Pill
                    key={x}
                    label={x}
                    active={selected.includes(x)}
                    onPress={() => toggle(x)}
                  />
                ))}
              </View>
            </View>
          )}
          {step === 2 && (
            <View style={{ gap: 18, paddingTop: 25 }}>
              <Header
                title="Where are you selling from?"
                subtitle="This sets your currency and available marketplace preparation. No precise location needed."
              />
              {COUNTRIES.map((c) => (
                <Pressable
                  key={c.code}
                  onPress={() => setCountry(c.code)}
                  style={[
                    styles.card,
                    styles.between,
                    country === c.code && {
                      borderColor: colors.green,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Text style={styles.h3}>{c.name}</Text>
                  <Ionicons
                    name={
                      country === c.code
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={24}
                    color={colors.green}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>
        <Button
          label={step === 2 ? "Start using SELLR" : "Continue"}
          disabled={step === 1 && !selected.length}
          onPress={() => {
            if (step < 2) setStep(step + 1);
            else {
              completeOnboarding(selected, country);
              router.replace("/(tabs)");
            }
          }}
        />
      </View>
    </Screen>
  );
}
