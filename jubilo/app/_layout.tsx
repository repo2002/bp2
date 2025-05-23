import { useTheme } from "@/hooks/useTheme";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { router, Slot, Stack, useSegments } from "expo-router";
import { useEffect, useCallback } from "react";
import { StatusBar, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

function Layout() {
  const theme = useTheme();
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();

  const onLayoutRootView = useCallback(async () => {
    if (isLoaded) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const inGuardedRoute = segments[0] === "(guarded)";
    if (isSignedIn && !inGuardedRoute) {
      router.replace("/(guarded)/(tabs)");
    } else if (!isSignedIn && inGuardedRoute) {
      router.replace("/");
    }
  }, [isSignedIn, isLoaded, segments]);

  return (
    <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <Stack>
          {/* //<Stack.Screen name="index" options={{ headerShown: false }} /> */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(guarded)" options={{ headerShown: false }} />
          {/* //<Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
        </Stack>
        <StatusBar backgroundColor={theme.colors.background} />
      </View>
    </ConvexProviderWithClerk>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey="pk_test_cmVsYXhpbmctYnVycm8tNDAuY2xlcmsuYWNjb3VudHMuZGV2JA"
    >
      <ClerkLoaded>
        <Layout />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
