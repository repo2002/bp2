import ThemeText from "@/components/theme/ThemeText";
import { StyleSheet, View } from "react-native";

const categoryColors = {
  party: "#FF6B81",
  meeting: "#6BCB77",
  sports: "#4D96FF",
  music: "#FFD93D",
  food: "#FFB26B",
  festival: "#A66CFF",
  wedding: "#FF6B81",
  reunion: "#6BCB77",
  other: "#BDBDBD",
};

export default function CategoryBadge({ category }) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: categoryColors[category] || "#BDBDBD" },
      ]}
    >
      <ThemeText color={"#fff"} style={styles.text}>
        {category?.toUpperCase()}
      </ThemeText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
