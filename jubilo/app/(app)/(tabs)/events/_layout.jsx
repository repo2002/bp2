import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function EventsLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Events",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/events/create")}
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
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Create Event",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
