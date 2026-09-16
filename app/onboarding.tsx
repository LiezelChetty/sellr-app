import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Button,
  Field,
  Header,
  Logo,
  Pill,
  Screen,
  styles,
} from "../src/components/ui";
import { COUNTRIES, getDefaultLocation } from "../src/config/regions";
import { LocationSelector } from "../src/components/LocationSelector";
import { useAppStore } from "../src/store/AppStore";
import { CountryCode } from "../src/types/domain";
import { colors } from "../src/theme";
export default function Onboarding() {
  const router = useRouter();
  const { completeOnboarding } = useAppStore();
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState<CountryCode>("IE");
  const [region, setRegion] = useState("Waterford");
  const [town, setTown] = useState("Waterford City");
  return (
    <Screen>
      <View
        style={{ flex: 1, justifyContent: "space-between", minHeight: 610 }}
      >
        <View style={{ gap: 20 }}>
          <View style={styles.between}>
            <Logo />
            <Text style={styles.small}>{step + 1} / 3</Text>
          </View>
          {step === 0 ? (
            <View style={{ gap: 18, paddingTop: 65 }}>
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 24,
                  backgroundColor: colors.greenSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="camera-outline"
                  size={34}
                  color={colors.greenDark}
                />
              </View>
              <Header
                title="Turn your clutter into cash."
                subtitle="Photograph the things you no longer need and put them up for sale in minutes."
              />
            </View>
          ) : null}
          {step === 1 ? (
            <View style={{ gap: 22, paddingTop: 35 }}>
              <Header
                title="Your online garage sale."
                subtitle="Clear out one thing or a whole room. OfferMe makes listing quick."
              />
              {[
                ["camera", "Take photos"],
                ["sparkles", "OfferMe prepares your listings"],
                ["people", "People nearby can make offers"],
              ].map(([icon, text]) => (
                <View key={text} style={styles.row}>
                  <View
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 15,
                      backgroundColor: colors.greenSoft,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name={`${icon}-outline` as any}
                      size={22}
                      color={colors.greenDark}
                    />
                  </View>
                  <Text style={styles.h3}>{text}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {step === 2 ? (
            <View style={{ gap: 15 }}>
              <Header
                title="Where are you selling?"
                subtitle="We only show your broad area—not a home address."
              />
              <View style={styles.wrap}>
                {COUNTRIES.map((c) => (
                  <Pill
                    key={c.code}
                    label={c.name}
                    active={country === c.code}
                    onPress={() => {
                      const next = getDefaultLocation(c.code);
                      setCountry(c.code);
                      setRegion(next.region);
                      setTown(next.town);
                    }}
                  />
                ))}
              </View>
              <LocationSelector
                country={country}
                region={region}
                town={town}
                onRegionChange={setRegion}
                onTownChange={setTown}
              />
              <View
                style={[
                  styles.row,
                  {
                    padding: 12,
                    backgroundColor: colors.greenSoft,
                    borderRadius: 14,
                  },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.greenDark}
                />
                <Text style={[styles.small, { flex: 1 }]}>
                  Never enter your street or precise home address here.
                </Text>
              </View>
            </View>
          ) : null}
        </View>
        <Button
          label={
            step === 0
              ? "Get Started"
              : step === 2
                ? "Start using OfferMe"
                : "Continue"
          }
          disabled={step === 2 && (!region || !town)}
          onPress={() => {
            if (step < 2) setStep(step + 1);
            else {
              completeOnboarding(country, region, town);
              router.replace("/(tabs)");
            }
          }}
        />
      </View>
    </Screen>
  );
}
