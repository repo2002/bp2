import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PrivacyProvider } from "@/contexts/PrivacyContext";
import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { getUserData } from "@/services/userService";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Ignore specific warnings
LogBox.ignoreLogs([
  "ViewPropTypes will be removed",
  "ColorPropType will be removed",
]);

const Layout = () => {
  return (
    <AuthProvider>
      <PrivacyProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <RootLayout />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </PrivacyProvider>
    </AuthProvider>
  );
};

const RootLayout = () => {
  const theme = useTheme();
  const { isDark } = theme;
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    try {
      console.log("Setting up auth state change listener");
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          console.log("Auth state changed:", _event);
          if (session) {
            setAuth(session);
            updatedUserData(session?.user);
            router.replace("/(app)/home");
          } else {
            setAuth(null);
            router.replace("/(auth)");
          }
        }
      );

      return () => {
        console.log("Cleaning up auth state change listener");
        authListener?.subscription?.unsubscribe();
      };
    } catch (error) {
      console.error("Error in auth state change setup:", error);
    }
  }, []);

  const updatedUserData = async (user) => {
    try {
      console.log("Fetching user data for:", user?.id);
      let res = await getUserData(user?.id);
      if (res.success) {
        setUserData(res.data);
      } else {
        console.error("Failed to fetch user data:", res.error);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </View>
  );
};

export default Layout;
