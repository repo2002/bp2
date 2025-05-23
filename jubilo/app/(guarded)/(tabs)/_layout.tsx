import { router, Tabs } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import ThemeText from "@/components/ThemeText";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Image } from "expo-image";

export default function TabsLayout() {
  const theme = useTheme();
  const { user } = useUser();
  const convexUser = useQuery(api.profile.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  if (!convexUser) return null;
  const username = convexUser.displayUsername;
  const imageUrl = convexUser.imageUrl;
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          paddingBottom: 0,
          marginBottom: 0,
          paddingTop: 4,
          height: 70,
        },
        // tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderBottomWidth: 0.3,
          borderBottomColor: theme.colors.grey,
        },
        headerTitleStyle: {
          color: theme.colors.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerLeft: () => (
            <View
              style={{
                marginLeft: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => router.push("/profile")}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: 30, height: 30, borderRadius: 15 }}
                />

                <ThemeText style={{ fontSize: 18, fontWeight: "bold" }}>
                  {username}
                </ThemeText>
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <View
              style={{
                marginRight: 16,
                flexDirection: "row",
                gap: 16,
              }}
            >
              <TouchableOpacity onPress={() => router.push("/notifications")}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/chat")}>
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
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
        name="post-new"
        options={{
          title: "Post",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="carpool"
        options={{
          title: "Carpool",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Market",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
