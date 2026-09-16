import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors } from "../../src/theme";
const icon =
  (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: { color: any; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.greenDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "800" },
        tabBarStyle: {
          height: 74,
          paddingTop: 6,
          paddingBottom: 8,
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
          tabBarIcon: () => (
            <Ionicons
              name="add"
              color={colors.white}
              size={28}
              style={{
                backgroundColor: colors.greenDark,
                borderRadius: 26,
                padding: 9,
                marginTop: -22,
              }}
            />
          ),
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
