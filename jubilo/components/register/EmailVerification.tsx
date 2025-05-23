import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import ThemeText from "../ThemeText";
import { useSignUp } from "@clerk/clerk-expo";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function EmailVerification({ onNext, data, prev }: any) {
  const theme = useTheme();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [clerkError, setClerkError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const email = data?.email || "";
  const firstName = data?.firstName || "";
  const lastName = data?.lastName || "";

  const verify = async () => {
    setClerkError(null);

    if (!isLoaded || !signUp) return;
    if (code.length !== 6) {
      setClerkError("Enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        onNext({ verified: true, showProfileSetup: true });
      } else {
        setClerkError("Verification incomplete. Try again.");
      }
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.message || "Invalid code or verification failed.";
      setClerkError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (!isLoaded || !signUp || resendCooldown > 0) return;

    setResendLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResendCooldown(60);
      const countdown = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || "Failed to resend code.";
      setClerkError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  const handleBack = () => {
    prev();
  };

  return (
    <View style={styles.container}>
      <ThemeText style={styles.label}>
        Hey {data.firstName} {data.lastName}, we sent a code to{" "}
        <ThemeText style={{ fontWeight: "bold" }}>{email}</ThemeText>
      </ThemeText>

      <TextInput
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        placeholder="Enter 6-digit code"
        placeholderTextColor={theme.colors.grey}
        style={[
          styles.input,
          { borderColor: theme.colors.text, color: theme.colors.text },
        ]}
        maxLength={6}
      />

      {clerkError && (
        <ThemeText style={[styles.error, { color: theme.colors.error }]}>
          {clerkError}
        </ThemeText>
      )}

      <View style={{ marginTop: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <Button title="Verify Email" onPress={verify} />
        )}
      </View>

      <TouchableOpacity
        onPress={resendCode}
        disabled={resendCooldown > 0 || resendLoading}
        style={[
          styles.resendButton,
          {
            opacity: resendCooldown > 0 || resendLoading ? 0.5 : 1,
          },
        ]}
      >
        <ThemeText style={{ color: theme.colors.primary }}>
          {resendLoading
            ? "Sending..."
            : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend code"}
        </ThemeText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleBack}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 10,
          backgroundColor: theme.colors.invertedBackground,
          padding: 16,
          width: "100%",
          marginTop: 16,
        }}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color={theme.colors.invertedText}
          style={{ marginLeft: 8 }}
        />
        <ThemeText
          color={theme.colors.invertedText}
          style={{ fontWeight: "bold", fontSize: 16 }}
        >
          Back
        </ThemeText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: "center",
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    marginTop: 10,
  },
  error: {
    marginTop: 8,
    fontSize: 14,
  },
  resendButton: {
    marginTop: 16,
    alignItems: "center",
  },
});
