import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { useTheme } from "@/hooks/useTheme";

export default function Loader() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={theme.colors.text} />
    </View>
  );
}
