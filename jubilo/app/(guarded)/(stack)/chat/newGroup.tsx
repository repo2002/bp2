import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  TextInput,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "@/components/ThemeText";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-expo";

interface User {
  _id: Id<"users">;
  name: string;
  imageUrl?: string;
  username: string;
}

export default function NewGroup() {
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
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length >= 2) {
      // TODO: Create group chat
      router.back();
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
      <ScrollView style={styles.content}>
        <View style={styles.groupInfo}>
          <TextInput
            style={[
              styles.groupNameInput,
              {
                borderColor: theme.colors.greyLight,
                color: theme.colors.text,
              },
            ]}
            placeholder="Group name"
            placeholderTextColor={theme.colors.grey}
            value={groupName}
            onChangeText={setGroupName}
          />

          {selectedUsers.length > 0 && (
            <View style={styles.selectedUsers}>
              <ThemeText style={styles.selectedUsersTitle}>
                Selected Users ({selectedUsers.length})
              </ThemeText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedUsers.map((user) => (
                  <View key={user._id} style={styles.selectedUser}>
                    <Image
                      source={
                        user.imageUrl
                          ? { uri: user.imageUrl }
                          : require("@/assets/images/ios-light.png")
                      }
                      style={styles.selectedUserAvatar}
                    />
                    <ThemeText
                      style={styles.selectedUserName}
                      numberOfLines={1}
                    >
                      {user.name}
                    </ThemeText>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.userList}
        />
      </ScrollView>

      {selectedUsers.length >= 2 && groupName.trim() && (
        <Pressable
          style={[
            styles.createButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleCreateGroup}
        >
          <ThemeText style={styles.createButtonText}>Create Group</ThemeText>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  createButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
