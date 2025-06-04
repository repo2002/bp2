import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function EventCardMedium({ event, onPress }) {
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
      <View style={styles.imageWrapper}>
        {event.images?.[0]?.image_url ? (
          <Image
            source={{ uri: event.images[0].image_url }}
            style={styles.image}
          />
        ) : (
          <View style={styles.image} />
        )}
        <View style={[styles.dateBadge, { backgroundColor: "white" }]}>
          <ThemeText color="black" style={styles.dateText}>
            {day}
          </ThemeText>
          <ThemeText color="red" style={styles.monthText}>
            {month}
          </ThemeText>
        </View>
      </View>
      <View style={styles.info}>
        <ThemeText style={styles.title}>{event.title}</ThemeText>
        <View style={{ flexDirection: "row" }}>
          <Ionicons name="location" size={16} color={theme.colors.primary} />
          <ThemeText
            color={theme.colors.primary}
            style={styles.meta}
            numberOfLines={1}
          >
            {event.location?.address}
          </ThemeText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 10,
    marginVertical: 6,

    marginHorizontal: 12,
    overflow: "hidden",
    elevation: 1,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: 80,
    height: 80,
  },
  dateBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: "center",
    zIndex: 2,
  },
  dateText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  monthText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: "#888",
  },
});
