import { Ionicons } from "@expo/vector-icons";
import React, { PropsWithChildren } from "react";
import {
  ActivityIndicator,
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

export function Screen({
  children,
  scroll = true,
  style,
}: PropsWithChildren<{ scroll?: boolean; style?: ViewStyle }>) {
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
export const Wordmark = () => <Text style={styles.wordmark}>SELLR</Text>;
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
          color={variant === "primary" ? colors.white : colors.green}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          variant !== "primary" && {
            color: variant === "danger" ? colors.danger : colors.green,
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
        placeholderTextColor="#9A9D99"
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
        {...props}
      />
    </View>
  );
}
export function DemoBanner() {
  return (
    <View style={styles.demo}>
      <Ionicons name="flask-outline" size={16} color={colors.warning} />
      <Text style={styles.demoText}>
        DEVELOPMENT DEMO · No live marketplace actions
      </Text>
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
      <Ionicons name={icon} size={34} color={colors.green} />
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
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flexGrow: 1, paddingBottom: 120 },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 16,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  wordmark: {
    fontSize: 24,
    letterSpacing: 4,
    fontWeight: "900",
    color: colors.green,
  },
  header: { gap: 6, marginVertical: 10 },
  eyebrow: {
    color: colors.accent,
    fontWeight: "800",
    letterSpacing: 1.3,
    fontSize: 12,
  },
  h1: { color: colors.ink, fontWeight: "800", fontSize: 32, lineHeight: 38 },
  h2: { color: colors.ink, fontWeight: "800", fontSize: 20 },
  h3: { color: colors.ink, fontWeight: "700", fontSize: 16 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 23 },
  body: { color: colors.ink, fontSize: 15, lineHeight: 22 },
  small: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 11,
    ...shadow,
  },
  button: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },
  button_primary: { backgroundColor: colors.green },
  button_secondary: { backgroundColor: colors.greenSoft },
  button_ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.line,
  },
  button_danger: { backgroundColor: "#F5E6E3" },
  buttonText: { color: colors.white, fontWeight: "800", fontSize: 15 },
  pill: {
    borderRadius: radius.pill,
    paddingHorizontal: 15,
    minHeight: 42,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  pillActive: { backgroundColor: colors.green, borderColor: colors.green },
  pillText: { color: colors.ink, fontWeight: "700" },
  pillTextActive: { color: colors.white },
  field: { gap: 7 },
  fieldLabel: { color: colors.ink, fontWeight: "700", fontSize: 13 },
  input: {
    backgroundColor: colors.surface,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    minHeight: 50,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  multiline: { minHeight: 112, paddingTop: 14, textAlignVertical: "top" },
  demo: {
    backgroundColor: "#F7EBD5",
    borderRadius: radius.md,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  demoText: {
    color: colors.warning,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.35,
    flex: 1,
  },
  empty: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  divider: { height: 1, backgroundColor: colors.line },
  stat: { flex: 1, minWidth: 130, gap: 4 },
  statValue: { fontWeight: "900", fontSize: 25, color: colors.green },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
});
