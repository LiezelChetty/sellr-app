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
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        tabBarStyle: {
          height: 76,
          paddingTop: 7,
          paddingBottom: 9,
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
        name="items"
        options={{ title: "MY ITEMS", tabBarIcon: icon("cube-outline") }}
      />
      <Tabs.Screen
        name="sell-action"
        options={{
          title: "SELL",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="add"
              color={colors.white}
              size={27}
              style={{
                backgroundColor: colors.green,
                borderRadius: 25,
                padding: 9,
                marginTop: -23,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: "INSIGHTS", tabBarIcon: icon("bar-chart-outline") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "PROFILE", tabBarIcon: icon("person-outline") }}
      />
    </Tabs>
  );
}
