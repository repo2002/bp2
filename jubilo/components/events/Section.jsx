import ThemeText from "@/components/theme/ThemeText";
import { View } from "react-native";

export default function Section({ icon, title, description, children }) {
  return (
    <View style={{ marginBottom: 32 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 4,
          paddingHorizontal: 16,
        }}
      >
        {icon}
        <ThemeText style={{ fontSize: 20, fontWeight: "bold", marginLeft: 8 }}>
          {title}
        </ThemeText>
      </View>
      <ThemeText
        style={{ color: "#888", marginBottom: 12, paddingHorizontal: 16 }}
      >
        {description}
      </ThemeText>
      {children}
    </View>
  );
}
