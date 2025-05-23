import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "@/components/ThemeText";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-expo";

type ChatType = "1-1" | "group";

interface User {
  _id: Id<"users">;
  name: string;
  imageUrl?: string;
  username: string;
}

export default function NewChat() {
  const theme = useTheme();
  const router = useRouter();
  const { userId } = useAuth();
  const { searchQuery } = useLocalSearchParams<{ searchQuery: string }>();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");

  const users = useQuery(api.users.list, {
    search: searchQuery,
  });

  const handleUserSelect = (user: User) => {
    if (selectedUsers.length === 0) {
      // First user selected - create 1-1 chat
      router.back();
      // TODO: Create 1-1 chat and navigate to it
    } else {
      setSelectedUsers((prev) =>
        prev.some((u) => u._id === user._id)
          ? prev.filter((u) => u._id !== user._id)
          : [...prev, user]
      );
    }
  };

  const renderUser = ({ item: user }: { item: User }) => {
    const isSelected = selectedUsers.some((u) => u._id === user._id);

    return (
      <Pressable
        style={[
          styles.userItem,
          {
            backgroundColor: isSelected
              ? theme.colors.primary + "20"
              : theme.colors.background,
          },
        ]}
        onPress={() => handleUserSelect(user)}
      >
        <Image
          source={
            user.imageUrl
              ? { uri: user.imageUrl }
              : require("@/assets/images/ios-light.png")
          }
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <ThemeText style={styles.userName}>{user.name}</ThemeText>
          <ThemeText style={[styles.username, { color: theme.colors.grey }]}>
            @{user.username}
          </ThemeText>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push("/chat/newGroup")}
          style={{
            backgroundColor: theme.colors.greyLightest,
            padding: 16,
            borderRadius: 16,
            width: "100%",
            gap: 12,
            shadowColor: "black",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderColor: theme.colors.greyLight,
              paddingBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Ionicons name="people" size={32} color={theme.colors.primary} />
              <ThemeText color="black" style={{ fontSize: 18 }}>
                Create new group
              </ThemeText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.colors.primary}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <ThemeText color="black" style={{ fontSize: 14, lineHeight: 20 }}>
              Hey there, you can create a group chat with your friends. And even
              add more people to the group later. You have so many
              functionalities to choose from!
            </ThemeText>
          </View>
        </Pressable>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.userList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  chatTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  chatTypeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  groupInfo: {
    padding: 16,
    gap: 16,
  },
  groupNameInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  selectedUsers: {
    gap: 8,
  },
  selectedUsersTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedUser: {
    alignItems: "center",
    marginRight: 12,
    width: 60,
  },
  selectedUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  selectedUserName: {
    fontSize: 12,
    textAlign: "center",
  },
  userList: {
    padding: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
  },
});
