import { useTheme } from "@/hooks/useTheme";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { router, Slot, useSegments } from "expo-router";
import { useEffect } from "react";
//import { router, Slot, useSegments } from "expo-router";
//import { useEffect } from "react";
import { StatusBar } from "react-native";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

function Layout() {
  const theme = useTheme();

  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();

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
      <Slot />
      <StatusBar backgroundColor={theme.colors.background} />
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
