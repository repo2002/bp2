import { Text, TextProps } from "react-native";
import { useTheme } from "../hooks/useTheme";

type ThemeTextProps = TextProps & {
  color?: string;
};

export default function ThemeText({ style, color, ...props }: ThemeTextProps) {
  const theme = useTheme();
  return (
    <Text {...props} style={[style, { color: color || theme.colors.text }]}>
      {props.children}
    </Text>
  );
}
