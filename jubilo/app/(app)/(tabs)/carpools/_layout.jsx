import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function CarpoolsLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Carpools",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/carpools/create")}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 50,
                widht: 35,
                height: 35,
                justifyContent: "center",
                alignItems: "center",
                padding: 5,
              }}
            >
              <Ionicons name="add" size={24} color={"white"} />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/carpools/add-car")}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 50,
                widht: 35,
                height: 35,
                justifyContent: "center",
                alignItems: "center",
                padding: 5,
              }}
            >
              <Ionicons name="car" size={24} color={"white"} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
