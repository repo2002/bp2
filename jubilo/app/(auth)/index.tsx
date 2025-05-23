import ThemeText from "@/components/ThemeText";
import { useTheme } from "@/hooks/useTheme";
import { useCallback, useEffect } from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { router } from "expo-router";

export default function Index() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
          onPress={() => {
            router.push("/login");
          }}
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
            Continue to login
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
