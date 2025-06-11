import Avatar from "@/components/Avatar";
import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const safeFormatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return format(d, "MMM d, h:mm a");
};

export default function CarpoolCardCompact({ carpool, onPress }) {
  const theme = useTheme();
  const departureTime = safeFormatDate(carpool.departure_time);
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.avatarRow}>
        <Avatar uri={carpool.driver?.image_url} size={36} />
      </View>
      <ThemeText style={styles.title} numberOfLines={1}>
        {carpool.title}
      </ThemeText>
      <View style={styles.row}>
        <Ionicons
          name="time-outline"
          size={14}
          color={theme.colors.primary}
          style={{ marginRight: 4 }}
        />
        <ThemeText style={styles.time}>{departureTime}</ThemeText>
      </View>
      <ThemeText style={styles.price} color={theme.colors.primary}>
        {carpool.price ? `€${carpool.price}` : "Free"}
      </ThemeText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    borderRadius: 10,
    padding: 10,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  avatarRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
  price: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 2,
  },
});
