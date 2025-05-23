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
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "@/components/ThemeText";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-expo";
import Loading from "@/components/Loader";
import * as ImagePicker from "expo-image-picker";

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
  const { searchQuery } = useLocalSearchParams();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [groupImage, setGroupImage] = useState<string | null>(null);

  // Get users list with search
  const users = useQuery(api.profile.list, {
    search: searchQuery as string,
  });
  const createChat = useMutation(api.chats.createChat);

  const handleUserSelect = (user: User) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedUsers.length >= 2) {
      try {
        setIsCreating(true);
        const chatId = await createChat({
          members: selectedUsers.map((u) => u._id),
          isGroup: true,
          groupName: groupName.trim(),
          groupDescription: groupDescription.trim(),
        });
        router.replace({
          pathname: "/chat/[id]",
          params: { id: chatId, name: groupName.trim() },
        });
      } catch (error) {
        console.error("Error creating group:", error);
        // TODO: Show error message
      } finally {
        setIsCreating(false);
      }
    }
  };

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setGroupImage(result.assets[0].uri);
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
              : theme.colors.cardBackground,
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
        {/* Group Info */}
        <View style={styles.groupInfo}>
          <View
            style={{
              flexDirection: "row",
              gap: 16,
              padding: 16,
              backgroundColor: theme.colors.cardBackground,
              borderRadius: 10,
            }}
          >
            {groupImage && (
              <Pressable onPress={pickImageAsync}>
                <Image
                  source={{ uri: groupImage }}
                  style={{ width: 50, height: 50, borderRadius: 25 }}
                  resizeMode="cover"
                />
              </Pressable>
            )}
            <View
              style={{
                flexDirection: "column",
                gap: 4,
              }}
            >
              <TextInput
                style={[
                  {
                    color: theme.colors.text,
                    fontSize: 20,
                    fontWeight: "500",
                  },
                ]}
                placeholder="Group name"
                placeholderTextColor={theme.colors.grey}
                value={groupName}
                onChangeText={setGroupName}
              />
              <TextInput
                style={[
                  {
                    color: theme.colors.text,
                    fontSize: 16,
                    fontWeight: "500",
                  },
                ]}
                placeholder="Group description (optional)"
                placeholderTextColor={theme.colors.grey}
                value={groupDescription}
                onChangeText={setGroupDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

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

        {/* User List */}
        {users === undefined ? (
          <Loading />
        ) : (
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.userList}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <ThemeText style={{ color: theme.colors.grey }}>
                  No users found
                </ThemeText>
              </View>
            )}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* Create Button */}
      {selectedUsers.length >= 2 && groupName.trim() && (
        <Pressable
          style={[
            styles.createButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleCreateGroup}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemeText style={styles.createButtonText}>Create Group</ThemeText>
          )}
        </Pressable>
      )}

      {/* Loading Overlay */}
      {isCreating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemeText style={{ marginTop: 12 }}>Creating group...</ThemeText>
        </View>
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

  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 8,
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
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
