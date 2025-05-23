import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSignUp } from "@clerk/clerk-expo";
import { useForm } from "@/contexts/FormContext";

import {
  Button,
  TextInput,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import ThemeText from "../ThemeText";
import { v } from "convex/values";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

export default function UserDetails({ onNext }: any) {
  const { isLoaded, signUp } = useSignUp();
  const theme = useTheme();
  const [clerkError, setClerkError] = useState<string | null>(null);
  const { formData, setFormData } = useForm();
  const checkUsername = useQuery(api.users.checkUsername, {
    username: formData.username,
  });

  const validate = async () => {
    const newErrors: any = {};

    console.log("Validation errors:", newErrors);
    return newErrors;
  };

  const onSubmit = async () => {
    if (!isLoaded) return;

    //client-side checks
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.username ||
      !formData.password
    ) {
      setClerkError("All fields are required.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setClerkError("Passwords do not match.");
      return;
    }

    if (checkUsername === false) {
      setClerkError("Username is taken.");
      return;
    }

    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        username: formData.username.replace(/^@/, ""),
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      onNext();
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || "Signup failed.";
      console.error("Clerk signup error:", message);
      setClerkError(message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          flexDirection: "column",
          padding: 16,
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={{ flexDirection: "column", gap: 10 }}>
            <View style={{ flexDirection: "column", gap: 5 }}>
              <TextInput
                placeholder="First name"
                value={formData.firstName}
                autoCorrect={false}
                onChangeText={(text) =>
                  setFormData({ ...formData, firstName: text })
                }
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.text,
                    color: theme.colors.text,
                  },
                ]}
                placeholderTextColor={theme.colors.greyDark}
              />
            </View>
            <View style={{ flexDirection: "column", gap: 5 }}>
              <TextInput
                placeholder="Last name"
                value={formData.lastName}
                autoCorrect={false}
                onChangeText={(text) =>
                  setFormData({ ...formData, lastName: text })
                }
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.text,
                    color: theme.colors.text,
                  },
                ]}
                placeholderTextColor={theme.colors.greyDark}
              />
            </View>

            <View style={{ flexDirection: "column", gap: 5 }}>
              <TextInput
                placeholder="Email"
                value={formData.email}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.text,
                    color: theme.colors.text,
                  },
                ]}
                placeholderTextColor={theme.colors.greyDark}
              />
            </View>

            <View style={{ flexDirection: "column", gap: 5 }}>
              <View
                style={[
                  styles.input,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 10,
                    borderColor: theme.colors.text,
                  },
                ]}
              >
                <ThemeText>@</ThemeText>
                <TextInput
                  placeholder="Username"
                  value={formData.username}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  onChangeText={(text) =>
                    setFormData({ ...formData, username: text })
                  }
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: theme.colors.text,
                  }}
                  placeholderTextColor={theme.colors.greyDark}
                />
              </View>
            </View>

            <View style={{ flexDirection: "column", gap: 5 }}>
              <TextInput
                placeholder="Password"
                secureTextEntry={true}
                value={formData.password}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.text,
                    color: theme.colors.text,
                  },
                ]}
                placeholderTextColor={theme.colors.greyDark}
              />
            </View>

            <View style={{ flexDirection: "column", gap: 5 }}>
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.text,
                    color: theme.colors.text,
                  },
                ]}
                placeholderTextColor={theme.colors.greyDark}
              />
            </View>
            {clerkError && (
              <ThemeText color={theme.colors.error}>{clerkError}</ThemeText>
            )}
          </View>
        </KeyboardAvoidingView>
        <TouchableOpacity
          onPress={onSubmit}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 10,
            backgroundColor: theme.colors.invertedBackground,
            padding: 16,
            width: "100%",
          }}
        >
          <ThemeText
            color={theme.colors.invertedText}
            style={{ fontWeight: "bold", fontSize: 16 }}
          >
            Next
          </ThemeText>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.invertedText}
            style={{ marginRight: 8 }}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    width: "100%",
    borderRadius: 3,
    padding: 16,
    fontSize: 16,
  },
});
