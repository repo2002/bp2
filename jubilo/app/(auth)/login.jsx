import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemeText from "../../components/theme/ThemeText";
import { useTheme } from "../../hooks/theme";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;

      // Success - navigate to home
      router.replace("/(app)/home");
    } catch (error) {
      console.error("Login error:", error);
      if (error.message.includes("Invalid login credentials")) {
        setError("Invalid email or password");
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemeText style={styles.title}>Hey,</ThemeText>
        <ThemeText style={styles.title}>Welcome Back</ThemeText>
        <ThemeText style={[styles.subtitle, { color: theme.colors.grey }]}>
          Sign in to continue
        </ThemeText>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={theme.colors.grey}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Email"
            placeholderTextColor={theme.colors.grey}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError("");
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={theme.colors.grey}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Password"
            placeholderTextColor={theme.colors.grey}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError("");
            }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.showPassword}
            onPress={handleShowPassword}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={theme.colors.grey}
            />
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={theme.colors.error}
            />
            <ThemeText color={theme.colors.error}>{error}</ThemeText>
          </View>
        ) : null}

        <TouchableOpacity style={styles.forgotPassword}>
          <ThemeText color={theme.colors.primary}>Forgot Password?</ThemeText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.buttonText}>Sign In</Text>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <ThemeText>Don't have an account? </ThemeText>
        <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
          <ThemeText color={theme.colors.primary}>Sign Up</ThemeText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    paddingBottom: 20,
  },
});
