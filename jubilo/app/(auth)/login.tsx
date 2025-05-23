import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useTheme } from "@/hooks/useTheme";

export default function Login() {
  const theme = useTheme();
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [mode, setMode] = useState<"email" | "username">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    const loginId =
      mode === "username" ? identifier.replace(/^@/, "") : identifier;

    try {
      const attempt = await signIn.create({
        identifier: loginId,
        password,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/(guarded)/(tabs)");
      } else {
        setError("Verification required");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Sign In
          </Text>

          <View style={styles.tabRow}>
            <TouchableOpacity
              onPress={() => setMode("email")}
              style={[styles.tab, mode === "email" && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "email" && styles.tabTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode("username")}
              style={[styles.tab, mode === "username" && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "username" && styles.tabTextActive,
                ]}
              >
                Username
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: 16 }}>
            <TextInput
              autoCapitalize="none"
              value={
                mode === "username"
                  ? `@${identifier.replace(/^@/, "")}`
                  : identifier
              }
              placeholder={`Enter your ${mode}`}
              placeholderTextColor={theme.colors.grey}
              onChangeText={(text) => setIdentifier(text.replace(/^@/, ""))}
              style={[
                styles.input,
                { color: theme.colors.text, borderColor: theme.colors.text },
              ]}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <TextInput
              secureTextEntry
              value={password}
              placeholder="Enter password"
              placeholderTextColor={theme.colors.grey}
              onChangeText={setPassword}
              style={[
                styles.input,
                { color: theme.colors.text, borderColor: theme.colors.text },
              ]}
            />
          </View>

          {error && (
            <Text style={{ color: theme.colors.error, marginBottom: 12 }}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            onPress={onSignInPress}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 16,
            }}
          >
            <Text style={{ color: theme.colors.text }}>
              Don't have an account?{" "}
            </Text>
            <Link href="/signup">
              <Text style={{ color: theme.colors.primary, fontWeight: "bold" }}>
                Sign up
              </Text>
            </Link>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  tabRow: {
    flexDirection: "row",
    marginBottom: 24,
    justifyContent: "center",
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabActive: {
    borderColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  tabTextActive: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
});
