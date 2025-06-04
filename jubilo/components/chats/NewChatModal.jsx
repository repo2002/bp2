import Avatar from "@/components/Avatar";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { useTheme } from "@/hooks/theme";
import { createDirectChat, createGroupChat } from "@/services/chatService";
import { getFollowing } from "@/services/followService";
import { getUserData } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EmptyState from "../EmptyState";

export default function NewChatModal({ visible, onClose, onCreate }) {
  const theme = useTheme();
  const { user } = useAuth();
  const authUserId = user?.id;
  const { followingIds: privacyFollowingIds } = usePrivacy();
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!authUserId) return;

      try {
        setLoading(true);
        const following = await getFollowing(authUserId);
        const followingIds = following.data.map((f) => f.following_id);

        // Fetch user data for each following ID
        const usersData = await Promise.all(
          followingIds.map((id) => getUserData(id))
        );

        // Filter out failed requests and map to user objects
        const validUsers = usersData
          .filter((result) => result.success && result.data)
          .map((result) => result.data)
          .filter((u) => u.id !== authUserId); // Exclude current user

        setUsers(validUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authUserId]);

  // Filter users based on search
  const filteredUsers = users.filter(
    (u) =>
      `${u?.full_name || ""}`.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateChat = async (userId) => {
    if (!authUserId) return;

    try {
      setCreating(true);
      const { success, data, error } = await createDirectChat(
        authUserId,
        userId
      );

      if (success) {
        onCreate(data);
        onClose();
      } else {
        console.error("Error creating chat:", error);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!authUserId || !groupName) return;

    try {
      setCreating(true);
      const { success, data, error } = await createGroupChat(
        authUserId,
        groupName,
        filteredUsers.map((u) => u.id)
      );

      if (success) {
        onCreate(data);
        onClose();
      } else {
        console.error("Error creating group:", error);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.3)" }]}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={[{ justifyContent: "flex-end", width: "100%" }]}
            disabled={creating}
          >
            <Ionicons name="close" color={theme.colors.text} size={30} />
          </TouchableOpacity>
          <View style={styles.switchRow}>
            <TouchableOpacity
              onPress={() => setIsGroup(false)}
              style={[
                styles.switchBtn,
                !isGroup && { backgroundColor: theme.colors.primary },
              ]}
            >
              <ThemeText
                style={{
                  color: !isGroup ? "white" : theme.colors.text,
                  fontWeight: "bold",
                }}
              >
                New Chat
              </ThemeText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsGroup(true)}
              style={[
                styles.switchBtn,
                isGroup && { backgroundColor: theme.colors.primary },
              ]}
            >
              <ThemeText
                style={{
                  color: isGroup ? "white" : theme.colors.text,
                  fontWeight: "bold",
                }}
              >
                New Group
              </ThemeText>
            </TouchableOpacity>
          </View>
          {isGroup && (
            <TextInput
              placeholder="Group Name"
              value={groupName}
              onChangeText={setGroupName}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.greyLight,
                },
              ]}
              placeholderTextColor={theme.colors.grey}
            />
          )}
          <ThemeText style={{ marginBottom: 8, fontWeight: "600" }}>
            {isGroup ? "Select Participants:" : "Select User:"}
          </ThemeText>
          <TextInput
            placeholder="Search users..."
            value={search}
            onChangeText={setSearch}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.greyLight,
                marginBottom: 8,
              },
            ]}
            placeholderTextColor={theme.colors.grey}
          />
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            style={{ marginBottom: 8 }}
            ListEmptyComponent={
              <EmptyState
                message={loading ? "Loading users..." : "No users found."}
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => (isGroup ? null : handleCreateChat(item.id))}
                style={[
                  styles.userRow,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <Avatar size={50} uri={item.image_url} />
                <View style={{ flex: 1, gap: 4 }}>
                  <ThemeText style={{ fontWeight: "600" }}>
                    {item.username}
                  </ThemeText>
                  <ThemeText style={{ color: theme.colors.grey }}>
                    {item.full_name || `${item.first_name} ${item.last_name}`}
                  </ThemeText>
                </View>
              </TouchableOpacity>
            )}
          />
          <View style={styles.buttonRow}>
            {isGroup && (
              <TouchableOpacity
                onPress={handleCreateGroup}
                style={[
                  styles.createBtn,
                  { backgroundColor: theme.colors.primary },
                ]}
                disabled={creating || !groupName || filteredUsers.length === 0}
              >
                {creating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemeText style={{ color: "white", fontWeight: "bold" }}>
                    Create Group
                  </ThemeText>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  container: {
    width: "100%",
    height: "90%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  switchRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  switchBtn: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedUser: {
    backgroundColor: "#e0e0e0",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginRight: 8,
  },
  createBtn: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
});
