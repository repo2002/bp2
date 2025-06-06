import Avatar from "@/components/Avatar";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EventInviteUserList({
  users,
  onInvite,
  invitedUserIds = [],
}) {
  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Avatar size={40} uri={item.image_url} />
          <View style={styles.nameContainer}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.name}>
              {item.first_name} {item.last_name}
            </Text>
          </View>
          {invitedUserIds.includes(item.id) ? (
            <Text style={styles.invited}>Invited</Text>
          ) : (
            <TouchableOpacity
              style={styles.inviteBtn}
              onPress={() => onInvite(item)}
            >
              <Text style={styles.inviteText}>Invite</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No users to invite.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  nameContainer: {
    flex: 1,
    marginLeft: 10,
    gap: 4,
  },
  username: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  name: {
    color: "#aaa",
    fontSize: 14,
  },
  inviteBtn: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inviteText: {
    color: "#fff",
    fontWeight: "bold",
  },
  invited: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
});
