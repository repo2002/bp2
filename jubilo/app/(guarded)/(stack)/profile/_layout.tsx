import { router, Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import DropdownMenu from "@/components/DropDownMenu";
import { SignOutButton } from "@clerk/clerk-react";
import ThemeText from "@/components/ThemeText";

export default function ProfileLayout() {
  const theme = useTheme();
  const { user } = useUser();
  const userProfile = useQuery(api.profile.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  if (!user || !userProfile) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          color: theme.colors.text,
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: userProfile.displayUsername,
          headerRight: () => (
            <View
              style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
            >
              <TouchableOpacity
                onPress={() => router.push("/(guarded)/(tabs)/post-new")}
              >
                <MaterialIcons
                  name="add-box"
                  size={26}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <DropdownMenu
                trigger={Ionicons}
                triggerIconName="ellipsis-vertical"
                options={[
                  {
                    key: "edit-profile",
                    label: "Edit Profile",
                    icon: Ionicons,
                    iconName: "pencil-outline",
                    onPress: () => router.push("/profile/edit"),
                  },
                  {
                    icon: Ionicons,
                    iconName: "settings",
                    label: "Settings",
                    onPress: () => router.push("/profile/settings"),
                  },
                  {
                    icon: Ionicons,
                    iconName: "log-out",
                    key: "logout",
                    label: "Logout",
                    onPress: () => <SignOutButton />,
                  },
                ]}
              />
            </View>
          ),
        }}
      />

      <Stack.Screen name="posts" />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: true,
          title: "Edit Profile",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="chevron-back"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
