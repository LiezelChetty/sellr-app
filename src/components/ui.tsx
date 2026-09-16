import { Ionicons } from "@expo/vector-icons";
import React, { PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, shadow } from "../theme";
import { Listing } from "../types/domain";
import OfficialOfferMeLogo from "../../assets/branding/offerme-logo.svg";
export function Screen({
  children,
  scroll = true,
  style,
}: PropsWithChildren<{ scroll?: boolean; style?: StyleProp<ViewStyle> }>) {
  const content = <View style={[styles.content, style]}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
export const Logo = () => (
  <View
    accessibilityRole="header"
    accessibilityLabel="OfferMe"
    style={styles.logoFrame}
  >
    <OfficialOfferMeLogo width={70} height={56} />
  </View>
);
export const Wordmark = Logo;
export function Header({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.header}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.h1}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}
export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled,
}: {
  label: string;
  onPress(): void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[`button_${variant}`],
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.45 },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={19}
          color={variant === "primary" ? colors.white : colors.greenDark}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          variant !== "primary" && {
            color: variant === "danger" ? colors.danger : colors.greenDark,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Card({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?(): void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.pill, active && styles.pillActive]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Field({
  label,
  multiline,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor="#939A95"
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
        {...props}
      />
    </View>
  );
}
export function DemoTag({ text = "Demo marketplace" }: { text?: string }) {
  return (
    <View style={styles.demo}>
      <Ionicons name="flask-outline" size={13} color={colors.warning} />
      <Text style={styles.demoText}>{text}</Text>
    </View>
  );
}
export function Empty({
  icon = "cube-outline",
  title,
  body,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={32} color={colors.green} />
      <Text style={styles.h2}>{title}</Text>
      <Text style={[styles.subtitle, { textAlign: "center" }]}>{body}</Text>
    </View>
  );
}
export const Loading = () => (
  <View style={styles.loading}>
    <ActivityIndicator color={colors.green} />
  </View>
);
export const money = (symbol: string, value: number) =>
  `${symbol}${value.toFixed(0)}`;
export const ago = (date: string) => {
  const h = Math.max(
    1,
    Math.floor((Date.now() - new Date(date).getTime()) / 3600000),
  );
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
};
export function ListingCard({
  listing,
  symbol,
  favourite,
  onPress,
  onFavourite,
}: {
  listing: Listing;
  symbol: string;
  favourite: boolean;
  onPress(): void;
  onFavourite(): void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.listingCard}>
      <View>
        <Image
          source={{ uri: listing.photos[0] }}
          style={styles.listingImage}
        />
        <Pressable
          accessibilityLabel={
            favourite ? "Remove from saved items" : "Save item"
          }
          onPress={(e) => {
            e.stopPropagation();
            onFavourite();
          }}
          style={styles.heart}
        >
          <Ionicons
            name={favourite ? "heart" : "heart-outline"}
            size={20}
            color={favourite ? colors.danger : colors.ink}
          />
        </Pressable>
        {listing.isDemo ? (
          <View style={styles.imageDemo}>
            <Text style={styles.imageDemoText}>DEMO</Text>
          </View>
        ) : null}
      </View>
      <View style={{ gap: 2, padding: 10 }}>
        <Text style={styles.price}>{money(symbol, listing.askingPrice)}</Text>
        <Text numberOfLines={1} style={styles.h3}>
          {listing.title}
        </Text>
        <Text style={styles.small}>
          {listing.approximateLocation} · {ago(listing.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flexGrow: 1, paddingBottom: 105 },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 14,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  logoFrame: {
    width: 82,
    height: 66,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  header: { gap: 4, marginVertical: 5 },
  eyebrow: {
    color: colors.greenDark,
    fontWeight: "900",
    letterSpacing: 1,
    fontSize: 11,
  },
  h1: { color: colors.ink, fontWeight: "900", fontSize: 28, lineHeight: 33 },
  h2: { color: colors.ink, fontWeight: "800", fontSize: 19 },
  h3: { color: colors.ink, fontWeight: "700", fontSize: 15 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  body: { color: colors.ink, fontSize: 15, lineHeight: 21 },
  small: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 9,
    ...shadow,
  },
  button: {
    minHeight: 48,
    paddingHorizontal: 17,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  button_primary: { backgroundColor: colors.greenDark },
  button_secondary: { backgroundColor: colors.greenSoft },
  button_ghost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  button_danger: { backgroundColor: "#FBE9E7" },
  buttonText: { color: colors.white, fontWeight: "800", fontSize: 14 },
  pill: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    minHeight: 39,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  pillActive: {
    backgroundColor: colors.greenDark,
    borderColor: colors.greenDark,
  },
  pillText: { color: colors.ink, fontWeight: "700" },
  pillTextActive: { color: colors.white },
  field: { gap: 6, flex: 1 },
  fieldLabel: { color: colors.ink, fontWeight: "700", fontSize: 13 },
  input: {
    backgroundColor: colors.surface,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    minHeight: 48,
    paddingHorizontal: 13,
    fontSize: 16,
  },
  multiline: { minHeight: 98, paddingTop: 13, textAlignVertical: "top" },
  demo: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF4CB",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  demoText: {
    color: colors.warning,
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 0.2,
  },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 42,
    paddingHorizontal: 22,
  },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 9 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  divider: { height: 1, backgroundColor: colors.line },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  listingCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  listingImage: {
    width: "100%",
    aspectRatio: 1.15,
    backgroundColor: colors.greenSoft,
  },
  heart: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageDemo: {
    position: "absolute",
    left: 7,
    bottom: 7,
    backgroundColor: "rgba(17,23,19,.75)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  imageDemoText: { color: "white", fontWeight: "900", fontSize: 9 },
  price: { fontSize: 19, fontWeight: "900", color: colors.ink },
});
