import { useTheme } from "@/hooks/theme";
import { requestFollow, unfollowUser } from "@/services/followService";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import ThemeText from "./theme/ThemeText";

export default function RequestButton({
  userId,
  hasPendingRequest,
  onRequest,
  onCancel,
  style,
}) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);
    console.log("RequestButton: Starting request flow", {
      userId,
      hasPendingRequest,
    });

    try {
      if (hasPendingRequest) {
        console.log("RequestButton: Canceling request");
        const { error } = await unfollowUser(userId);
        if (error) throw error;
        console.log("RequestButton: Request canceled successfully");
        onCancel?.();
      } else {
        console.log("RequestButton: Sending follow request");
        const { data, error } = await requestFollow(userId);
        console.log("RequestButton: Request response", { data, error });
        if (error) throw error;
        console.log("RequestButton: Request sent successfully");
        onRequest?.();
      }
    } catch (err) {
      console.error("RequestButton: Error handling request:", err);
    } finally {
      setLoading(false);
    }
  };

  const getButtonStyle = () => {
    if (hasPendingRequest) {
      return {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.text,
      };
    }
    return {
      backgroundColor: theme.colors.primary,
    };
  };

  const getButtonText = () => {
    if (hasPendingRequest) {
      return "Cancel Request";
    }
    return "Request";
  };

  const getTextColor = () => {
    if (hasPendingRequest) {
      return theme.colors.text;
    }
    return theme.colors.background;
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <ThemeText style={[styles.buttonText, { color: getTextColor() }]}>
          {getButtonText()}
        </ThemeText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
