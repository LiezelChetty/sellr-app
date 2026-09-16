import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { colors, shadow } from "../../src/theme";
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
        tabBarLabelStyle: { fontSize: 10, fontWeight: "800", marginTop: 3 },
        tabBarStyle: {
          paddingTop: 6,
          paddingBottom: 6,
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
          tabBarIcon: () => (
            <View
              style={{
                width: 32,
                height: 24,
                overflow: "visible",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  left: -12,
                  top: -22,
                  width: 56,
                  height: 56,
                  backgroundColor: colors.greenDark,
                  borderRadius: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  ...shadow,
                }}
              >
                <Ionicons name="add" color={colors.white} size={30} />
              </View>
            </View>
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
