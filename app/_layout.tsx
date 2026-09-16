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
          headerTintColor: colors.green,
          headerTitleStyle: { fontWeight: "800" },
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="sell" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ title: "Item details" }} />
        <Stack.Screen name="accounts" options={{ title: "Selling accounts" }} />
        <Stack.Screen name="plans" options={{ title: "Plans & credits" }} />
        <Stack.Screen name="region" options={{ title: "Selling region" }} />
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
