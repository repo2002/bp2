import ThemeText from "@/components/theme/ThemeText";
import { getShortContent } from "@/helpers/common";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function EventCardSmall({ event, onPress }) {
  const theme = useTheme();
  const dateObj = new Date(event.start_time);
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = dateObj
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {event.images?.[0]?.image_url ? (
        <Image
          source={{ uri: event.images[0].image_url }}
          style={styles.image}
        />
      ) : (
        <View style={styles.image} />
      )}
      <View style={styles.info}>
        <ThemeText style={styles.title} numberOfLines={1}>
          {event.title}
        </ThemeText>
        <ThemeText style={styles.date}>{`${day} ${month}`}</ThemeText>
        <View style={{ flexDirection: "row", gap: 4 }}>
          <Ionicons name="location" size={16} color={theme.colors.primary} />
          <ThemeText
            color={theme.colors.primary}
            style={styles.meta}
            numberOfLines={1}
          >
            {getShortContent(event.location?.address, 10)}
          </ThemeText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 8,
    elevation: 1,
    gap: 8,
  },
  image: {
    width: 140,
    height: 70,
  },
  info: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  date: {
    fontSize: 11,
    color: "#888",
  },
});
