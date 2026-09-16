import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { colors } from "../theme";

export function useSafeBack(fallback: Href) {
  const router = useRouter();
  return () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallback);
  };
}

export function SafeBackButton({ fallback }: { fallback: Href }) {
  const goBack = useSafeBack(fallback);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={12}
      onPress={goBack}
      style={{ padding: 4 }}
    >
      <Ionicons name="chevron-back" size={27} color={colors.greenDark} />
    </Pressable>
  );
}
