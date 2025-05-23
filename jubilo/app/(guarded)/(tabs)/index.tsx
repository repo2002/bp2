import ThemeText from "@/components/ThemeText";
import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";
import { useUser } from "@clerk/clerk-expo";

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useUser();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ThemeText>Home</ThemeText>
      <ThemeText>
        {user?.emailAddresses[0].emailAddress}
        {user?.username}
      </ThemeText>
    </View>
  );
}
