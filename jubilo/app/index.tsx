import ThemeText from "@/components/ThemeText";
import { View } from "react-native";
import { useTheme } from "../hooks/useTheme";

export default function Index() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <ThemeText color={theme.colors.greyLightest} style={{ fontSize: 20 }}>
        Edit app/index.tsx to edit this screen.
      </ThemeText>
    </View>
  );
}
