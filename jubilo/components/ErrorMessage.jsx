import { StyleSheet, View } from "react-native";
import ThemeText from "./theme/ThemeText";

export default function ErrorMessage({ error, style }) {
  if (!error) return null;
  return (
    <View style={[styles.container, style]}>
      <ThemeText style={styles.text}>{error}</ThemeText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffeaea",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#d32f2f",
    fontSize: 15,
    textAlign: "center",
  },
});
