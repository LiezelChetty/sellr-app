import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { colors, shadow } from "../../src/theme";
const icon =
  (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: { color: any; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
const SellTabButton = ({ onPress, accessibilityState }: any) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel="Sell"
    accessibilityState={accessibilityState}
    onPress={onPress}
    style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", overflow: "visible" }}
  >
    <View
      style={{ pointerEvents: "none", position: "absolute", top: -22, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.greenDark, alignItems: "center", justifyContent: "center", ...shadow }}
    >
      <Ionicons name="add" color={colors.white} size={31} />
    </View>
    <Text style={{ color: colors.greenDark, fontSize: 10, fontWeight: "800", marginBottom: 1 }}>SELL</Text>
  </Pressable>
);
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.greenDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "800", marginTop: 3 },
        tabBarStyle: {
          height: 68,
          paddingTop: 6,
          paddingBottom: 7,
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "HOME", tabBarIcon: icon("home-outline") }}
      />
      <Tabs.Screen
        name="browse"
        options={{ title: "BROWSE", tabBarIcon: icon("search-outline") }}
      />
      <Tabs.Screen
        name="sell-action"
        options={{
          title: "SELL",
          tabBarItemStyle: { overflow: "visible" },
          tabBarButton: SellTabButton,
          tabBarLabel: () => null,
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{ title: "OFFERS", tabBarIcon: icon("pricetag-outline") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "PROFILE", tabBarIcon: icon("person-outline") }}
      />
    </Tabs>
  );
}
