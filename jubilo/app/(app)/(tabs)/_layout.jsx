import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import { getUserChats } from "@/services/chatService";
import { Ionicons } from "@expo/vector-icons";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function AppLayout() {
  const theme = useTheme();
  const { user } = useAuth();
  const [unreadTotal, setUnreadTotal] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchUnread() {
      if (!user?.id) return;
      const { success, data } = await getUserChats(user.id);

      if (success && isMounted) {
        const total = data.reduce((sum, room) => sum + (room.unread || 0), 0);

        setUnreadTotal(total);
      }
    }
    fetchUnread();
    // Optionally, subscribe to new messages and refetch
    const interval = setInterval(fetchUnread, 10000); // poll every 10s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.id]);

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
              <View>
                <Ionicons name="chatbubbles" size={size} color={color} />
                {unreadTotal > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -8,
                      backgroundColor: theme.colors.error,
                      borderRadius: 8,
                      minWidth: 16,
                      height: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 3,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      {unreadTotal > 99 ? "99+" : unreadTotal}
                    </Text>
                  </View>
                )}
              </View>
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
