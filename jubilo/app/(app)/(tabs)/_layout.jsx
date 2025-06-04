import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Tabs } from "expo-router";

export default function AppLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.grey,
          height: 70,
          paddingBottom: 0,
          marginBottom: 0,
          paddingTop: 8,
          alignItems: "center",
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.grey,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="carpools/index"
        options={{
          title: "Carpool",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace/index"
        options={{
          title: "Market",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "index";
          return {
            title: "Chats",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),

            tabBarShowLabel: false,
            tabBarStyle:
              routeName === "[id]"
                ? { display: "none" }
                : {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.colors.grey,
                    height: 70,
                    paddingBottom: 0,
                    marginBottom: 0,
                    paddingTop: 8,
                    alignItems: "center",
                  },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.grey,
          };
        }}
      />
    </Tabs>
  );
}
