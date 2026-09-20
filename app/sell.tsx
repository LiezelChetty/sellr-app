import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import {
  Button,
  DemoTag,
  Field,
  Header,
  Logo,
  Pill,
  Screen,
  styles,
} from "../src/components/ui";
import { CATEGORIES, REGIONS } from "../src/config/regions";
import { itemAnalysisService } from "../src/services/ai";
import { useAppStore } from "../src/store/AppStore";
import { AIAnalysis } from "../src/types/domain";
import { colors } from "../src/theme";
import { useSafeBack } from "../src/components/navigation";
const blank: AIAnalysis = {
  title: "",
  category: "Home",
  subcategory: "",
  brand: "",
  condition: "Good",
  description: "",
  suggestedPrice: 0,
  priceConfidence: 0,
  tags: [],
  warnings: [],
  analysisSource: "manual",
};
const CONDITIONS = ["New", "Like new", "Good", "Fair", "For parts"];
export default function Sell() {
  const router = useRouter();
  const goBack = useSafeBack("/(tabs)");
  const { preferences, addListing, demoMode } = useAppStore();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState(blank);
  const [loading, setLoading] = useState(false);
  const pick = async (camera = false) => {
    if (camera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted)
        return Alert.alert(
          "Camera permission needed",
          "Allow camera access or choose existing photos.",
        );
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({ quality: 0.9 })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.9,
          allowsMultipleSelection: true,
          selectionLimit: 10,
        });
    if (!result.canceled)
      setPhotos((x) => [...x, ...result.assets.map((a) => a.uri)].slice(0, 10));
  };
  const analyse = async () => {
    try {
      setLoading(true);
      setAnalysis(await itemAnalysisService.analyse(photos, { demoMode }));
      setStep(1);
    } catch (e) {
      Alert.alert(
        "Enter the details manually",
        e instanceof Error
          ? e.message
          : "We couldn’t prepare this listing automatically. You can enter the details yourself.",
      );
      setAnalysis({
        ...blank,
        analysisSource: "manual",
        warnings: [
          "Automatic suggestions were unavailable. Enter and check the listing details yourself.",
        ],
      });
      setStep(1);
    } finally {
      setLoading(false);
    }
  };
  const update = (key: keyof AIAnalysis, value: string) =>
    setAnalysis((a) => ({
      ...a,
      [key]: key === "suggestedPrice" ? Number(value) || 0 : value,
    }));
  const finish = async () => {
    try {
      setLoading(true);
      const id = await addListing({ ...analysis, photos });
      router.replace(`/item/${id}?created=1`);
    } catch (error) {
      Alert.alert(
        "Could not publish listing",
        error instanceof Error ? error.message : "Try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Screen>
      <View style={styles.between}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={step ? "Previous step" : "Back to Home"}
          hitSlop={12}
          onPress={() => (step ? setStep(step - 1) : goBack())}
        >
          <Ionicons name="arrow-back" size={25} color={colors.greenDark} />
        </Pressable>
        <Logo />
        <Text style={styles.small}>{step + 1}/3</Text>
      </View>
      {demoMode ? (
        <DemoTag text="Development preview · photographs are not analysed" />
      ) : null}
      {step === 0 ? (
        <>
          <Header
            eyebrow="START SELLING"
            title="Photograph one thing—or a whole clear-out."
            subtitle="Add original photos, then review every suggested detail before publishing."
          />
          <View style={[styles.wrap, { minHeight: 145 }]}>
            {photos.map((uri, i) => (
              <Pressable
                key={`${uri}-${i}`}
                onPress={() => setPhotos((x) => x.filter((_, n) => n !== i))}
              >
                <Image
                  source={{ uri }}
                  style={{ width: 105, height: 105, borderRadius: 15 }}
                />
                <Ionicons
                  name="close-circle"
                  size={22}
                  color={colors.ink}
                  style={{ position: "absolute", right: 4, top: 4 }}
                />
              </Pressable>
            ))}
            {!photos.length ? (
              <View
                style={{
                  flex: 1,
                  minHeight: 145,
                  borderRadius: 18,
                  backgroundColor: colors.greenSoft,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Ionicons
                  name="images-outline"
                  size={34}
                  color={colors.greenDark}
                />
                <Text style={styles.small}>
                  Original item photos stay honest and unaltered
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
            label="Choose Multiple Photos"
            icon="images-outline"
            variant="secondary"
            onPress={() => pick(false)}
          />
          <Button
            disabled={!photos.length || loading}
            label={
              loading ? "Analysing original photos…" : "Prepare listing draft"
            }
            onPress={analyse}
          />
          <Button
            disabled={!photos.length || loading}
            label="Enter details manually"
            variant="ghost"
            onPress={() => {
              setAnalysis({ ...blank, analysisSource: "manual" });
              setStep(1);
            }}
          />
        </>
      ) : null}
      {step === 1 ? (
        <>
          <Header
            title="Check your item"
            subtitle="Suggestions can be wrong. You control every detail and nothing publishes until you confirm."
          />
          {analysis.analysisSource === "vision" &&
          analysis.priceConfidence < 0.65 ? (
            <View
              style={{
                padding: 12,
                borderRadius: 14,
                backgroundColor: "#FFF4CB",
              }}
            >
              <Text style={styles.body}>
                We’re not completely sure about this item — check the details
                before publishing.
              </Text>
            </View>
          ) : null}
          {analysis.warnings?.map((warning) => (
            <Text key={warning} style={styles.small}>
              • {warning}
            </Text>
          ))}
          <Field
            label="Title"
            value={analysis.title}
            onChangeText={(v) => update("title", v)}
          />
          <View style={styles.wrap}>
            {CATEGORIES.map((c) => (
              <Pill
                key={c}
                label={c}
                active={analysis.category === c}
                onPress={() => update("category", c)}
              />
            ))}
          </View>
          <Field
            label="Subcategory"
            value={analysis.subcategory}
            onChangeText={(v) => update("subcategory", v)}
          />
          <Field
            label="Brand (optional)"
            value={analysis.brand}
            onChangeText={(v) => update("brand", v)}
          />
          <Text style={styles.h3}>Condition suggestion</Text>
          <View style={styles.wrap}>
            {CONDITIONS.map((condition) => (
              <Pill
                key={condition}
                label={condition}
                active={analysis.condition === condition}
                onPress={() => update("condition", condition)}
              />
            ))}
          </View>
          <Field
            label="Description"
            multiline
            value={analysis.description}
            onChangeText={(v) => update("description", v)}
          />
          <Field
            label={`${analysis.analysisSource === "vision" ? "AI price estimate" : "Asking price"} (${REGIONS[preferences.countryCode].symbol})`}
            keyboardType="numeric"
            value={String(analysis.suggestedPrice)}
            onChangeText={(v) => update("suggestedPrice", v)}
          />
          <Text style={styles.small}>
            {analysis.analysisSource === "vision"
              ? "This is a cautious AI estimate, not live market-comparable pricing. Choose the asking price yourself."
              : "Choose an asking price you are comfortable with."}
          </Text>
          <Button
            label="Review listing"
            disabled={!analysis.title || !analysis.suggestedPrice}
            onPress={() => setStep(2)}
          />
        </>
      ) : null}
      {step === 2 ? (
        <>
          <Header
            title="Ready for your garage sale"
            subtitle="Publish this item on OfferMe or return to edit. Your approximate area is shown publicly."
          />
          <View style={styles.card}>
            <Image
              source={{ uri: photos[0] }}
              style={{ width: "100%", height: 220, borderRadius: 14 }}
            />
            <Text style={styles.h1}>{analysis.title}</Text>
            <Text style={styles.h2}>
              {REGIONS[preferences.countryCode].symbol}
              {analysis.suggestedPrice}
            </Text>
            <Text style={styles.body}>
              {analysis.condition} · {preferences.town}
            </Text>
          </View>
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
              name="storefront-outline"
              size={22}
              color={colors.greenDark}
            />
            <Text style={[styles.body, { flex: 1 }]}>
              You can add this item to a named garage sale from My Sales after
              publishing.
            </Text>
          </View>
          <Button label="Publish on OfferMe" onPress={finish} />
          <Button
            label="Back to edit"
            variant="ghost"
            onPress={() => setStep(1)}
          />
          <Text style={styles.small}>
            No payment, courier, collection scheduling or buyer protection is
            provided. You arrange the transaction directly.
          </Text>
        </>
      ) : null}
    </Screen>
  );
}
