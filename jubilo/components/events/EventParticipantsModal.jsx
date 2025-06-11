import Avatar from "@/components/Avatar";
import { useTheme } from "@/hooks/theme";
import { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EventInviteStep from "./EventInviteStep";

export default function EventParticipantsModal({
  visible,
  onClose,
  participants = [],
  eventId,
  inviterId,
  isPrivate,
  isOwner,
}) {
  const theme = useTheme();
  const [showInvite, setShowInvite] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Participants
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: theme.colors.text }]}>
              ✕
            </Text>
          </TouchableOpacity>
          {isOwner && isPrivate && !showInvite && (
            <TouchableOpacity
              onPress={() => setShowInvite(true)}
              style={styles.plusBtn}
            >
              <Text style={[styles.plusText, { color: theme.colors.primary }]}>
                ＋
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {showInvite ? (
          <EventInviteStep
            eventId={eventId}
            inviterId={inviterId}
            isPrivate={isPrivate}
          />
        ) : (
          <FlatList
            data={participants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.row, { borderColor: theme.colors.grey }]}>
                <Avatar size={40} uri={item.user.image_url} />
                <View style={styles.nameContainer}>
                  <Text style={[styles.username, { color: theme.colors.text }]}>
                    {item.user.username}
                  </Text>
                  <Text style={[styles.name, { color: theme.colors.grey }]}>
                    {item.user.first_name} {item.user.last_name}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: theme.colors.grey }]}>
                No participants yet.
              </Text>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 22,
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    fontSize: 22,
  },
  plusBtn: {
    padding: 8,
    marginLeft: 8,
  },
  plusText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  nameContainer: {
    flex: 1,
    marginLeft: 10,
    gap: 4,
  },
  username: {
    fontSize: 16,
  },
  name: {
    fontSize: 16,
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
  },
});
