import { useTheme } from "@/hooks/theme";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import ThemeText from "./theme/ThemeText";

export default function LoadingIndicator({
  text = "Loading...",
  size = "small",
  style,
}) {
  const theme = useTheme();
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {text ? <ThemeText style={styles.text}>{text}</ThemeText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 8,
  },
  text: {
    fontSize: 15,
  },
});
