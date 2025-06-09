import Avatar from "@/components/Avatar";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import {
  addParticipant,
  getChatById,
  removeParticipant,
} from "@/services/chatService";
import { getFollowing } from "@/services/followService";
import { getUserData } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GroupDetails() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchChat = async () => {
      if (!params?.id) return;
      setLoading(true);
      const { success, data } = await getChatById(params.id);
      if (success) setChat(data);
      setLoading(false);
    };
    fetchChat();
  }, [params?.id]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAddingParticipant || !user?.id) return;

      try {
        setSearchLoading(true);
        const following = await getFollowing(user.id);
        const followingIds = following.data.map((f) => f.following_id);

        // Fetch user data for each following ID
        const usersData = await Promise.all(
          followingIds.map((id) => getUserData(id))
        );

        // Filter out failed requests and map to user objects
        const validUsers = usersData
          .filter((result) => result.success && result.data)
          .map((result) => result.data)
          .filter((u) => u.id !== user.id); // Exclude current user

        // Filter out users who are already participants
        const existingParticipantIds =
          chat?.participants?.map((p) => p.user.id) || [];
        const filteredUsers = validUsers.filter(
          (user) => !existingParticipantIds.includes(user.id)
        );

        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setSearchLoading(false);
      }
    };

    fetchUsers();
  }, [isAddingParticipant, chat?.participants, user?.id]);

  // Filter users based on search
  const filteredUsers = users.filter(
    (u) =>
      `${u?.first_name} ${u?.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddParticipant = async (userId) => {
    try {
      const { success, error } = await addParticipant(chat.id, userId);
      if (success) {
        // Refresh chat data
        const { success: refreshSuccess, data } = await getChatById(chat.id);
        if (refreshSuccess) {
          setChat(data);
          setSearch("");
          setUsers([]);
          setIsAddingParticipant(false);
        }
      } else {
        Alert.alert("Error", error || "Failed to add participant");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!chat || !chat.is_group) {
    return (
      <View style={styles.centered}>
        <ThemeText>No group details found.</ThemeText>
      </View>
    );
  }

  const isAdmin = chat.participants?.find(
    (p) => p.user?.id === user?.id && p.role === "admin"
  );

  const handleRemoveParticipant = async (participantId) => {
    if (!isAdmin) return;

    Alert.alert(
      "Remove Participant",
      "Are you sure you want to remove this participant from the group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const { success, error } = await removeParticipant(
                chat.id,
                participantId
              );
              if (success) {
                // Refresh chat data
                const { success: refreshSuccess, data } = await getChatById(
                  chat.id
                );
                if (refreshSuccess) setChat(data);
              } else {
                Alert.alert("Error", error || "Failed to remove participant");
              }
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert("Leave Group", "Are you sure you want to leave this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            const { success, error } = await removeParticipant(
              chat.id,
              user.id
            );
            if (success) {
              router.back();
            } else {
              Alert.alert("Error", error || "Failed to leave group");
            }
          } catch (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const renderParticipant = ({ item }) => {
    const participant = item.user;
    const isCurrentUser = participant.id === user?.id;
    const isParticipantAdmin = item.role === "admin";

    return (
      <View style={styles.participantRow}>
        <Avatar size={50} uri={participant.image_url} />
        <View style={styles.participantInfo}>
          <ThemeText style={styles.participantName}>
            {[participant.first_name, participant.last_name]
              .filter(Boolean)
              .join(" ") || participant.username}
          </ThemeText>
          <ThemeText style={styles.participantRole}>
            {isParticipantAdmin ? "Admin" : "Member"}
          </ThemeText>
        </View>
        {isAdmin && !isCurrentUser && (
          <TouchableOpacity
            onPress={() => handleRemoveParticipant(participant.id)}
            style={styles.removeButton}
          >
            <Ionicons
              name="close-circle"
              size={24}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultRow}
      onPress={() => handleAddParticipant(item.id)}
    >
      <Avatar size={40} uri={item.image_url} />
      <View style={styles.searchResultInfo}>
        <ThemeText style={styles.searchResultName}>
          {[item.first_name, item.last_name].filter(Boolean).join(" ") ||
            item.username}
        </ThemeText>
        <ThemeText style={styles.searchResultUsername}>
          {item.username}
        </ThemeText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      {/* Custom Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: insets.top + 8,
          paddingBottom: 8,
          paddingHorizontal: 12,
          backgroundColor: theme.colors.background,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.colors.grey,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (isAddingParticipant) {
              setIsAddingParticipant(false);
              setSearch("");
              setUsers([]);
            } else {
              router.back();
            }
          }}
          style={{ padding: 4, marginRight: 8 }}
        >
          <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View style={{ marginRight: 12 }}>
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  chat?.name || "Group"
                )}`,
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.greyLight,
              }}
            />
          </View>
          <View style={{ flexShrink: 1 }}>
            <ThemeText
              style={{
                fontSize: 18,
                fontWeight: "bold",
              }}
              numberOfLines={1}
            >
              {isAddingParticipant ? "Add Participants" : chat?.name}
            </ThemeText>
            <ThemeText
              style={{ color: theme.colors.grey, fontSize: 14 }}
              numberOfLines={1}
            >
              {isAddingParticipant
                ? "Search users to add"
                : `${chat?.participants?.length || 0} members`}
            </ThemeText>
          </View>
        </View>
      </View>

      {isAddingParticipant ? (
        <View style={[styles.searchContainer]}>
          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: theme.colors.cardBackground },
            ]}
          >
            <Ionicons name="search" size={20} color={theme.colors.grey} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search users..."
              placeholderTextColor={theme.colors.grey}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            {searchLoading && (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            )}
          </View>

          <FlatList
            data={filteredUsers}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            style={styles.searchResultsList}
            ListEmptyComponent={
              search.trim() ? (
                <View style={styles.emptySearchContainer}>
                  <ThemeText style={styles.emptySearchText}>
                    {searchLoading ? "Loading users..." : "No users found"}
                  </ThemeText>
                </View>
              ) : null
            }
          />
        </View>
      ) : (
        <>
          {/* Group Info */}
          <View style={styles.groupInfo}>
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  chat?.name || "Group"
                )}`,
              }}
              style={styles.groupAvatar}
            />
            <ThemeText style={styles.groupName}>{chat?.name}</ThemeText>
            <ThemeText style={styles.memberCount}>
              {chat?.participants?.length || 0} members
            </ThemeText>
          </View>

          {/* Participants List */}
          <View style={styles.participantsSection}>
            <View style={styles.sectionHeader}>
              <ThemeText style={styles.sectionTitle}>Participants</ThemeText>
              {isAdmin && (
                <TouchableOpacity
                  onPress={() => setIsAddingParticipant(true)}
                  style={styles.addButton}
                >
                  <Ionicons name="add" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={chat?.participants}
              renderItem={renderParticipant}
              keyExtractor={(item) => item.user.id}
              style={styles.participantsList}
            />
          </View>

          {/* Leave Group Button */}
          <TouchableOpacity
            onPress={handleLeaveGroup}
            style={[
              styles.leaveButton,
              { backgroundColor: theme.colors.error },
            ]}
          >
            <ThemeText style={styles.leaveButtonText}>Leave Group</ThemeText>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  groupInfo: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  groupAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 16,
    color: "#666",
  },
  participantsSection: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  addButton: {
    padding: 4,
  },
  participantsList: {
    flex: 1,
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  participantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "500",
  },
  participantRole: {
    fontSize: 14,
    color: "#666",
  },
  removeButton: {
    padding: 4,
  },
  leaveButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  leaveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  searchContainer: {
    flex: 1,
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",

    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  searchResultInfo: {
    marginLeft: 12,
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "500",
  },
  searchResultUsername: {
    fontSize: 14,
    color: "#666",
  },
  emptySearchContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptySearchText: {
    fontSize: 16,
    color: "#666",
  },
});
