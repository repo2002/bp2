import Avatar from "@/components/Avatar";
import { useTheme } from "@/hooks/theme";
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
  invitationStatuses = {},
}) {
  const theme = useTheme();

  const renderInvitationStatus = (userId) => {
    const status = invitationStatuses[userId];
    if (!status) return null;

    switch (status) {
      case "accepted":
        return (
          <Text style={{ color: theme.colors.success, fontWeight: "bold" }}>
            Accepted
          </Text>
        );
      case "rejected":
        return (
          <Text style={{ color: theme.colors.error, fontWeight: "bold" }}>
            Declined
          </Text>
        );
      case "pending":
        return (
          <Text style={{ color: theme.colors.warning, fontWeight: "bold" }}>
            Invited
          </Text>
        );
      default:
        return null;
    }
  };

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={[styles.row, { borderColor: theme.colors.gey }]}>
          <Avatar size={40} uri={item.image_url} />
          <View style={styles.nameContainer}>
            <Text style={[styles.username, { color: theme.colors.text }]}>
              {item.username}
            </Text>
            <Text style={[styles.name, { color: theme.colors.grey }]}>
              {item.first_name} {item.last_name}
            </Text>
          </View>
          {invitationStatuses[item.id] ? (
            renderInvitationStatus(item.id)
          ) : (
            <TouchableOpacity
              style={[
                styles.inviteBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => onInvite(item)}
            >
              <Text style={styles.inviteText}>Invite</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      ListEmptyComponent={
        <Text style={[styles.empty, { color: theme.colors.grey }]}>
          No users to invite.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
  },
  nameContainer: {
    flex: 1,
    marginLeft: 10,
    gap: 4,
  },
  username: {
    flex: 1,
    fontSize: 16,
  },
  name: {
    fontSize: 14,
  },
  inviteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inviteText: {
    color: "#fff",
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
  },
});
