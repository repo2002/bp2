import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PrivacyProvider } from "@/contexts/PrivacyContext";
import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { getUserData } from "@/services/userService";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
    supabase.auth.onAuthStateChange((_event, session) => {
      // console.log("session", session?.user);
      if (session) {
        setAuth(session);
        updatedUserData(session?.user);
        router.replace("/(app)/home");
      } else {
        setAuth(null);
        router.replace("/(auth)");
      }
    });
  }, []);

  const updatedUserData = async (user) => {
    let res = await getUserData(user?.id);
    //console.log("res", res);
    if (res.success) {
      setUserData(res.data);
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
