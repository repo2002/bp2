import ThemeText from "@/components/theme/ThemeText";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

export default function Section({
  icon,
  title,
  description,
  children,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={{ marginBottom: 32 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {icon}
          <ThemeText
            style={{ fontSize: 20, fontWeight: "bold", marginLeft: 8 }}
          >
            {title}
          </ThemeText>
        </View>
        {onPress && <Ionicons name="chevron-forward" size={20} color="#888" />}
      </View>
      <ThemeText
        style={{ color: "#888", marginBottom: 12, paddingHorizontal: 16 }}
      >
        {description}
      </ThemeText>
      {children}
    </TouchableOpacity>
  );
}
