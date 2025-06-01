import { useTheme } from "@/hooks/theme";
import { Text } from "react-native";

export default function ThemeText({ style, color, ...props }) {
  const theme = useTheme();
  return (
    <Text {...props} style={[style, { color: color || theme.colors.text }]}>
      {props.children}
    </Text>
  );
}
