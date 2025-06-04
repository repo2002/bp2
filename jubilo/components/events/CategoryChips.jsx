import ThemeText from "@/components/theme/ThemeText";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

const categories = [
  "All",
  "Party",
  "Meeting",
  "Sports",
  "Music",
  "Food",
  "Festival",
  "Wedding",
  "Reunion",
  "Other",
];

export default function CategoryChips({ selected, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 8 }}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[styles.chip, selected === cat && styles.chipSelected]}
          onPress={() => onSelect(cat)}
        >
          <ThemeText
            style={selected === cat ? styles.chipTextSelected : styles.chipText}
          >
            {cat}
          </ThemeText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: "#4a90e2",
  },
  chipText: {
    color: "#333",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
});
