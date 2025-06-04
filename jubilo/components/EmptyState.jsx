import { useTheme } from "@/hooks/theme";
import { StyleSheet, View } from "react-native";
import ThemeText from "./theme/ThemeText";

export default function EmptyState({
  message = "Nothing here yet.",
  style,
  children,
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        style,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ThemeText style={styles.text}>{message}</ThemeText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});
