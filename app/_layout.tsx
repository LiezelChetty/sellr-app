import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AppStoreProvider, useAppStore } from "../src/store/AppStore";
import { Loading } from "../src/components/ui";
import { colors } from "../src/theme";
function Gate() {
  const { ready, preferences } = useAppStore();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (!ready) return;
    const onboarding = segments[0] === "onboarding";
    if (!preferences.onboarded && !onboarding) router.replace("/onboarding");
    if (preferences.onboarded && onboarding) router.replace("/(tabs)");
  }, [ready, preferences.onboarded, segments, router]);
  if (!ready) return <Loading />;
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerTintColor: colors.greenDark,
          headerTitleStyle: { fontWeight: "800" },
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="sell" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ title: "Listing" }} />
        <Stack.Screen name="offer/[id]" options={{ title: "Offer" }} />
        <Stack.Screen
          name="conversation/[id]"
          options={{ title: "Messages" }}
        />
        <Stack.Screen name="sale/[id]" options={{ title: "Garage sale" }} />
        <Stack.Screen name="seller/[id]" options={{ title: "Seller" }} />
        <Stack.Screen name="saved" options={{ title: "Saved items" }} />
        <Stack.Screen name="my-listings" options={{ title: "My listings" }} />
        <Stack.Screen name="my-sales" options={{ title: "My sales" }} />
        <Stack.Screen name="location" options={{ title: "Selling location" }} />
      </Stack>
    </>
  );
}
export default function RootLayout() {
  return (
    <AppStoreProvider>
      <Gate />
    </AppStoreProvider>
  );
}
