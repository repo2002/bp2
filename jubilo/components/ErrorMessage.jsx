import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import ThemeText from "./theme/ThemeText";

export default function ErrorMessage({ error, style }) {
  const theme = useTheme();
  if (!error) return null;
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="warning" color={theme.colors.error} size={20} />
      <ThemeText color={theme.colors.error} style={styles.text}>
        {error}
      </ThemeText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    flexDirection: "row",
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  text: {
    fontSize: 15,
    textAlign: "center",
  },
});
