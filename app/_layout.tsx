import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AppStoreProvider, useAppStore } from "../src/store/AppStore";
import { Loading } from "../src/components/ui";
import { colors } from "../src/theme";
import { SafeBackButton } from "../src/components/navigation";
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
        <Stack.Screen
          name="item/[id]"
          options={{
            title: "Listing",
            headerLeft: () => <SafeBackButton fallback="/(tabs)/browse" />,
          }}
        />
        <Stack.Screen
          name="offer/[id]"
          options={{
            title: "Offer",
            headerLeft: () => <SafeBackButton fallback="/(tabs)/offers" />,
          }}
        />
        <Stack.Screen
          name="conversation/[id]"
          options={{
            title: "Messages",
            headerLeft: () => <SafeBackButton fallback="/(tabs)/offers" />,
          }}
        />
        <Stack.Screen
          name="sale/[id]"
          options={{
            title: "Garage sale",
            headerLeft: () => <SafeBackButton fallback="/(tabs)" />,
          }}
        />
        <Stack.Screen
          name="seller/[id]"
          options={{
            title: "Seller",
            headerLeft: () => <SafeBackButton fallback="/(tabs)/browse" />,
          }}
        />
        <Stack.Screen
          name="saved"
          options={{
            title: "Saved items",
            headerLeft: () => <SafeBackButton fallback="/(tabs)/profile" />,
          }}
        />
        <Stack.Screen
          name="my-listings"
          options={{
            title: "My listings",
            headerLeft: () => <SafeBackButton fallback="/(tabs)/profile" />,
          }}
        />
        <Stack.Screen
          name="my-sales"
          options={{
            title: "My sales",
            headerLeft: () => <SafeBackButton fallback="/(tabs)/profile" />,
          }}
        />
        <Stack.Screen
          name="location"
          options={{
            title: "Selling location",
            headerLeft: () => <SafeBackButton fallback="/(tabs)/profile" />,
          }}
        />
        <Stack.Screen
          name="safety"
          options={{
            title: "Safety",
            headerLeft: () => <SafeBackButton fallback="/(tabs)/profile" />,
          }}
        />
        <Stack.Screen
          name="help"
          options={{
            title: "Help & policies",
            headerLeft: () => <SafeBackButton fallback="/(tabs)/profile" />,
          }}
        />
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
