import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CONVERSATIONS = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=10",
    },
    lastMessage: "See you at the community meeting!",
    time: "2m ago",
    unread: 2,
  },
  {
    id: "2",
    user: {
      name: "Mike Chen",
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    lastMessage: "Thanks for the ride yesterday!",
    time: "1h ago",
    unread: 0,
  },
  {
    id: "3",
    user: {
      name: "Emma Davis",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    lastMessage: "The book club meeting is at 7 PM",
    time: "3h ago",
    unread: 1,
  },
  {
    id: "4",
    user: {
      name: "Community Group",
      avatar: "https://i.pravatar.cc/150?img=13",
    },
    lastMessage: "New event: Neighborhood Cleanup this weekend",
    time: "5h ago",
    unread: 5,
  },
];

export default function Chats() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={[styles.conversationCard, { backgroundColor: theme.colors.card }]}
    >
      <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <ThemeText style={styles.userName}>{item.user.name}</ThemeText>
          <ThemeText style={[styles.time, { color: theme.colors.grey }]}>
            {item.time}
          </ThemeText>
        </View>
        <View style={styles.messageContainer}>
          <ThemeText
            style={[styles.lastMessage, { color: theme.colors.grey }]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </ThemeText>
          {item.unread > 0 && (
            <View
              style={[
                styles.unreadBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <ThemeText style={styles.unreadCount}>{item.unread}</ThemeText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <ThemeText style={styles.title}>Messages</ThemeText>
        <TouchableOpacity style={styles.createButton}>
          <Ionicons
            name="create-outline"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={theme.colors.grey}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search messages"
          placeholderTextColor={theme.colors.grey}
        />
      </View>

      <FlatList
        data={CONVERSATIONS}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.conversationsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  conversationsList: {
    padding: 16,
    gap: 16,
  },
  conversationCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
    justifyContent: "center",
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  time: {
    fontSize: 12,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
