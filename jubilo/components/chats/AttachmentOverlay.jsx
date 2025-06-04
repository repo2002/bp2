import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AttachmentOption = ({ icon, label, onPress }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.greyLight },
        ]}
      >
        <Ionicons name={icon} size={24} color={theme.colors.text} />
      </View>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export const AttachmentOverlay = ({ visible, onClose, onSelect }) => {
  const theme = useTheme();

  const options = [
    { icon: "camera", label: "Camera", type: "camera" },
    { icon: "images", label: "Gallery", type: "gallery" },
    { icon: "document", label: "Document", type: "document" },
    { icon: "location", label: "Location", type: "location" },
    { icon: "person", label: "Contact", type: "contact" },
    { icon: "stats-chart", label: "Poll", type: "poll" },
    { icon: "list", label: "ToDo", type: "todo" },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Add Attachment
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <AttachmentOption
                key={option.type}
                icon={option.icon}
                label={option.label}
                onPress={() => {
                  onSelect(option.type);
                  onClose();
                }}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  option: {
    width: "30%",
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    textAlign: "center",
  },
});
