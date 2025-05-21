import ThemeText from "@/components/ThemeText";
import { useTheme } from "@/hooks/useTheme";
import { useCallback, useEffect } from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  useWarmUpBrowser();

  const { startSSOFlow } = useSSO();

  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const onPress = useCallback(async () => {
    try {
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy: "oauth_google",
          // For web, defaults to current path
          // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
          // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
          redirectUrl: AuthSession.makeRedirectUri(),
        });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 12,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.background,
      }}
    >
      <View style={{ alignItems: "center" }}>
        <Image
          source={require("@/assets/images/adaptive-icon.png")}
          style={styles.image}
        />
        <ThemeText style={{ fontSize: 30 }}>Welcome to Jubilo</ThemeText>
      </View>
      <View style={{ width: "100%", flexDirection: "column", gap: 16 }}>
        <TouchableOpacity
          onPress={onPress}
          style={{
            backgroundColor: "white",
            padding: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 30,
            width: "100%",
            gap: 16,
            shadowColor: "black",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            elevation: 2,
            shadowRadius: 3,
          }}
        >
          <Image
            source={require("@/assets/images/google-icon.png")}
            style={{ width: 30, height: 30, resizeMode: "contain" }}
          />
          <ThemeText color="black" style={{ fontSize: 18 }}>
            Continue with Google
          </ThemeText>
        </TouchableOpacity>
        <ThemeText style={{ fontSize: 14, textAlign: "center" }}>
          By continuing you accept the
          <ThemeText color={theme.colors.primary}>
            Terms and Conditions
          </ThemeText>
          and the
          <ThemeText color={theme.colors.primary}> Privacy Statement</ThemeText>
          .
        </ThemeText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    alignSelf: "center",
    marginVertical: 16,
  },
});
