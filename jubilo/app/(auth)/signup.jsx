import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function Signup() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordStrength(calculatePasswordStrength(text));
  };

  const handleSignup = async () => {
    setIsLoading(true);
    setError("");

    // Validate all fields are filled
    if (!email || !password || !username || !firstName || !lastName) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (passwordStrength < 3) {
      setError("Password is too weak. Use at least 3/5 strength.");
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const formattedUsername = `@${username}`;

      // console.log("Attempting signup with:", {
      //   email,
      //   formattedUsername,
      //   firstName,
      //   lastName,
      // });

      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: formattedUsername,
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      // console.log("Signup response:", { session, error });

      if (error) {
        // console.error("Signup error:", error);
        setError(error.message);
        Alert.alert("Error", error.message);
      } else if (!session) {
        // console.log("No session, email verification required");
        Alert.alert(
          "Success",
          "Please check your inbox for email verification!"
        );
        router.push("/(auth)/login");
      }
    } catch (err) {
      // console.error("Unexpected error during signup:", err);
      setError("An unexpected error occurred");
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setError("");
      router.push("/(app)/home");
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
        <ThemeText style={styles.title}>Create Account</ThemeText>
        <ThemeText style={[styles.subtitle, { color: theme.colors.grey }]}>
          Sign up to get started
        </ThemeText>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color={theme.colors.grey}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="First Name"
            placeholderTextColor={theme.colors.grey}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color={theme.colors.grey}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Last Name"
            placeholderTextColor={theme.colors.grey}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View
          style={[styles.inputContainer, { flexDirection: "row", gap: 16 }]}
        >
          <ThemeText style={[styles.inputLabel, { fontSize: 20 }]}>@</ThemeText>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Username"
            placeholderTextColor={theme.colors.grey}
            value={username}
            onChangeText={(text) => {
              if (text.startsWith("@")) {
                setUsername(text.slice(1));
              } else {
                setUsername(text);
              }
            }}
            autoCapitalize="none"
          />
        </View>

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
            onChangeText={setEmail}
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
            onChangeText={handlePasswordChange}
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

        <View style={styles.passwordStrengthContainer}>
          {[...Array(5)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.strengthSegment,
                {
                  backgroundColor:
                    index < passwordStrength
                      ? index < 2
                        ? theme.colors.error
                        : index < 4
                        ? theme.colors.warning
                        : theme.colors.success
                      : theme.colors.greyLight,
                },
              ]}
            />
          ))}
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
            placeholder="Confirm Password"
            placeholderTextColor={theme.colors.grey}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.showPassword}
            onPress={handleShowConfirmPassword}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={20}
              color={theme.colors.grey}
            />
          </TouchableOpacity>
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={theme.colors.error}
            />
            <ThemeText color={theme.colors.error}>{error}</ThemeText>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
            isLoading && { opacity: 0.5, justifyContent: "center" },
          ]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.buttonText}>Create Account</Text>
              <Ionicons name="arrow-forward" size={24} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <ThemeText>Already have an account? </ThemeText>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <ThemeText color={theme.colors.primary}>Sign In</ThemeText>
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
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
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
  passwordStrengthContainer: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  strengthSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    paddingBottom: 20,
  },
});
