import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  SafeAreaView,
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

type ChatType = "DM" | "group";

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
  const { searchQuery } = useLocalSearchParams();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Get users list with search
  const users = useQuery(api.profile.list, {
    search: searchQuery as string,
  });
  const createChat = useMutation(api.chats.createChat);

  const handleUserSelect = async (user: User) => {
    if (selectedUsers.length === 0) {
      // First user selected - create 1-1 chat
      try {
        setIsCreating(true);
        const chatId = await createChat({
          members: [user._id],
          isGroup: false,
        });
        router.replace({
          pathname: "/chat/[id]",
          params: { id: chatId, name: user.name },
        });
      } catch (error) {
        console.error("Error creating chat:", error);
        // TODO: Show error message
      } finally {
        setIsCreating(false);
      }
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
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push("/chat/newGroup")}
          style={[
            styles.groupButton,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.primary,
              borderWidth: 1,
            },
          ]}
        >
          <View
            style={[
              styles.groupButtonHeader,
              {
                borderBottomWidth: 0.3,
                borderBottomColor: theme.colors.primary,
              },
            ]}
          >
            <View style={styles.groupButtonTitle}>
              <Ionicons name="people" size={32} color={theme.colors.primary} />
              <ThemeText color={theme.colors.text} style={{ fontSize: 18 }}>
                Create new group
              </ThemeText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.colors.primary}
            />
          </View>
          <ThemeText
            color={theme.colors.grey}
            style={{ fontSize: 14, lineHeight: 20 }}
          >
            Hey there, you can create a group chat with your friends. And even
            add more people to the group later. You have so many functionalities
            to choose from!
          </ThemeText>
        </Pressable>
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
              <ThemeText color={theme.colors.grey}>No users found</ThemeText>
            </View>
          )}
        />
      )}

      {/* Loading Overlay */}
      {isCreating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemeText style={{ marginTop: 12 }}>Creating chat...</ThemeText>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  groupButton: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupButtonHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
  },
  groupButtonTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  userList: {
    padding: 16,
    paddingTop: 0,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "red",
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
