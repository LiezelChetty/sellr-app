import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import {
  Button,
  Card,
  DemoBanner,
  Field,
  Header,
  money,
  Pill,
  Screen,
  styles,
  Wordmark,
} from "../src/components/ui";
import { getRegionalMarketplaces, REGIONS } from "../src/config/marketplaces";
import { itemAnalysisService } from "../src/services/ai";
import { useAppStore } from "../src/store/AppStore";
import { AIAnalysis } from "../src/types/domain";
import { colors } from "../src/theme";

const blank: AIAnalysis = {
  title: "",
  brand: "",
  category: "",
  subcategory: "",
  size: "",
  condition: "",
  colour: "",
  description: "",
  suggestedPriceLow: 0,
  suggestedPriceHigh: 0,
  recommendedPrice: 0,
  confidence: 0,
};
export default function Sell() {
  const router = useRouter();
  const params = useLocalSearchParams<{ source?: string }>();
  const { preferences, addListing } = useAppStore();
  const region = REGIONS[preferences.countryCode];
  const markets = getRegionalMarketplaces(preferences.countryCode);
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis>(blank);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const pick = async (camera = false) => {
    if (photos.length >= 4)
      return Alert.alert(
        "Photo limit",
        "SELLR supports up to four photos in V1.",
      );
    if (camera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Camera permission needed",
          "Allow camera access to photograph an item, or choose existing photos instead.",
        );
        return;
      }
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({
          quality: 0.9,
          allowsEditing: false,
        })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.9,
          allowsMultipleSelection: true,
          selectionLimit: 4 - photos.length,
        });
    if (!result.canceled)
      setPhotos((p) => [...p, ...result.assets.map((a) => a.uri)].slice(0, 4));
  };
  useEffect(() => {
    if (params.source === "library") pick(false);
  }, []);
  const analyse = async () => {
    try {
      setLoading(true);
      setAnalysis(await itemAnalysisService.analyse(photos));
      setStep(1);
    } catch (e) {
      Alert.alert(
        "Could not analyse",
        e instanceof Error ? e.message : "Try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const update = (key: keyof AIAnalysis, value: string) =>
    setAnalysis((a) => ({
      ...a,
      [key]: [
        "suggestedPriceLow",
        "suggestedPriceHigh",
        "recommendedPrice",
      ].includes(key)
        ? Number(value) || 0
        : value,
    }));
  const finish = () => {
    const id = addListing({ ...analysis, photos, marketplaceIds: selected });
    router.replace(`/item/${id}?created=1`);
  };
  return (
    <Screen>
      <View style={styles.between}>
        <Pressable
          onPress={() => (step ? setStep(step - 1) : router.back())}
          style={{ padding: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.green} />
        </Pressable>
        <Wordmark />
        <Text style={styles.small}>{step + 1} / 3</Text>
      </View>
      <DemoBanner />
      {step === 0 && (
        <>
          <Header
            eyebrow="STEP 1 · PHOTOS"
            title="Show us what you’re selling"
            subtitle="Take clear photos from different angles. Add 2–4 when possible."
          />
          <Card>
            <View style={styles.wrap}>
              {photos.map((uri, i) => (
                <Pressable
                  key={uri}
                  onPress={() => setPhotos((p) => p.filter((_, n) => n !== i))}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: 115, height: 115, borderRadius: 16 }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      right: 5,
                      top: 5,
                      backgroundColor: colors.ink,
                      borderRadius: 15,
                      padding: 4,
                    }}
                  >
                    <Ionicons name="close" size={15} color="white" />
                  </View>
                </Pressable>
              ))}
              {!photos.length ? (
                <View
                  style={{
                    height: 150,
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.greenSoft,
                    borderRadius: 18,
                    gap: 7,
                  }}
                >
                  <Ionicons
                    name="camera-outline"
                    size={36}
                    color={colors.green}
                  />
                  <Text style={styles.small}>
                    Original photos are always preserved
                  </Text>
                </View>
              ) : null}
            </View>
            <Button
              label="Take Photo"
              icon="camera-outline"
              onPress={() => pick(true)}
            />
            <Button
              label="Choose Photos"
              icon="images-outline"
              variant="secondary"
              onPress={() => pick(false)}
            />
          </Card>
          <Text style={styles.small}>
            SELLR never generates replacement product photos. Better listings.
            Honest photos.
          </Text>
          <Button
            disabled={!photos.length || loading}
            label={
              loading
                ? "Running mock analysis…"
                : "Analyse item (development mock)"
            }
            onPress={analyse}
          />
        </>
      )}
      {step === 1 && (
        <>
          <Header
            eyebrow="STEP 2 · REVIEW ITEM"
            title="Check every detail"
            subtitle="Every suggestion is editable before a draft is prepared."
          />
          <Card style={{ backgroundColor: "#F7EBD5" }}>
            <Text style={{ color: colors.warning, fontWeight: "800" }}>
              SELLR suggestions can be wrong.
            </Text>
            <Text style={styles.body}>
              Please check your item before publishing. This analysis is clearly
              mocked for development.
            </Text>
          </Card>
          <View style={styles.wrap}>
            <Field
              label="Title"
              value={analysis.title}
              onChangeText={(v) => update("title", v)}
            />
            <Field
              label="Brand"
              value={analysis.brand}
              onChangeText={(v) => update("brand", v)}
            />
          </View>
          <Field
            label="Category"
            value={analysis.category}
            onChangeText={(v) => update("category", v)}
          />
          <Field
            label="Subcategory"
            value={analysis.subcategory}
            onChangeText={(v) => update("subcategory", v)}
          />
          <Field
            label="Size"
            value={analysis.size}
            onChangeText={(v) => update("size", v)}
          />
          <Field
            label="Condition"
            value={analysis.condition}
            onChangeText={(v) => update("condition", v)}
          />
          <Field
            label="Colour"
            value={analysis.colour}
            onChangeText={(v) => update("colour", v)}
          />
          <Field
            label="Description"
            multiline
            value={analysis.description}
            onChangeText={(v) => update("description", v)}
          />
          <Card>
            <Text style={styles.h3}>Suggested price</Text>
            <Text style={styles.h2}>
              {money(region.symbol, analysis.suggestedPriceLow)}–
              {money(region.symbol, analysis.suggestedPriceHigh)}
            </Text>
            <Field
              label="Recommended asking price"
              keyboardType="numeric"
              value={String(analysis.recommendedPrice)}
              onChangeText={(v) => update("recommendedPrice", v)}
            />
            <Text style={styles.small}>
              Guidance only · mock confidence{" "}
              {Math.round(analysis.confidence * 100)}%
            </Text>
          </Card>
          <Button
            disabled={!analysis.title}
            label="Choose marketplaces"
            onPress={() => setStep(2)}
          />
        </>
      )}
      {step === 2 && (
        <>
          <Header
            eyebrow="STEP 3 · REGIONAL HANDOFF"
            title="Where do you want to sell it?"
            subtitle="Choose multiple marketplaces. Recommendations are guidance, not a promise of sale speed or price."
          />
          {markets.map((m) => (
            <Pressable
              key={m.id}
              onPress={() =>
                setSelected((s) =>
                  s.includes(m.id) ? s.filter((x) => x !== m.id) : [...s, m.id],
                )
              }
            >
              <Card
                style={[
                  styles.between,
                  selected.includes(m.id) && {
                    borderColor: colors.green,
                    borderWidth: 2,
                  },
                ]}
              >
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.h2}>{m.name}</Text>
                  <Text style={styles.subtitle}>{m.summary}</Text>
                  <Text style={styles.small}>
                    {m.capabilities.includes("OAUTH_AVAILABLE")
                      ? "Connection architecture available"
                      : "Preparation / handoff only"}
                  </Text>
                </View>
                <Ionicons
                  name={
                    selected.includes(m.id)
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={26}
                  color={colors.green}
                />
              </Card>
            </Pressable>
          ))}
          <Card>
            <Text style={styles.h3}>What happens next</Text>
            <Text style={styles.body}>
              SELLR creates editable drafts linked to one Master Listing.
              Nothing is published automatically.
            </Text>
          </Card>
          <Button
            disabled={!selected.length}
            label={`Prepare ${selected.length || ""} draft${selected.length === 1 ? "" : "s"}`}
            onPress={finish}
          />
        </>
      )}
    </Screen>
  );
}
