import Avatar from "@/components/Avatar";
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
  const [showInvite, setShowInvite] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Participants</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          {isOwner && isPrivate && !showInvite && (
            <TouchableOpacity
              onPress={() => setShowInvite(true)}
              style={styles.plusBtn}
            >
              <Text style={styles.plusText}>＋</Text>
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
              <View style={styles.row}>
                <Avatar size={40} uri={item.user.image_url} />
                <View style={styles.nameContainer}>
                  <Text style={styles.username}>{item.user.username}</Text>
                  <Text style={styles.name}>
                    {item.user.first_name} {item.user.last_name}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No participants yet.</Text>
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
    backgroundColor: "#181818",
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
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    color: "#fff",
    fontSize: 22,
  },
  plusBtn: {
    padding: 8,
    marginLeft: 8,
  },
  plusText: {
    color: "#4A90E2",
    fontSize: 28,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  name: {
    color: "#fff",
    fontSize: 16,
  },
  nameContainer: {
    flex: 1,
    marginLeft: 10,
    gap: 4,
  },
  username: {
    color: "#fff",
    fontSize: 16,
  },
  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
});
