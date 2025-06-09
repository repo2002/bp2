import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

export function AttachmentOverlay({ visible, onClose, onSelect }) {
  const theme = useTheme();

  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      style={[
        styles.overlay,
        {
          backgroundColor: theme.colors.cardBackground,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
          elevation: 8,
        },
      ]}
    >
      <View style={styles.header}>
        <ThemeText style={styles.title}>Send Attachment</ThemeText>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" color={theme.colors.text} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.optionsContainer}>
        <AttachmentButton
          label="Image"
          icon="image"
          onPress={() => onSelect("image")}
        />
        <AttachmentButton
          label="Video"
          icon="videocam"
          onPress={() => onSelect("video")}
        />
        <AttachmentButton
          label="Camera"
          icon="camera"
          onPress={() => onSelect("camera")}
        />
        <AttachmentButton
          label="Voice"
          icon="mic"
          onPress={() => onSelect("audio")}
        />
        <AttachmentButton
          label="Document"
          icon="document"
          onPress={() => onSelect("document")}
        />
      </View>
    </View>
  );
}

function AttachmentButton({ label, icon, onPress }) {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <View
        style={[styles.buttonIcon, { backgroundColor: theme.colors.greyLight }]}
      >
        <Ionicons name={icon} size={28} color={theme.colors.text} />
      </View>
      <ThemeText style={styles.buttonLabel}>{label}</ThemeText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    zIndex: 1000,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  button: {
    alignItems: "center",
    margin: 8,
    width: 72,
  },
  buttonIcon: {
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  buttonLabel: {
    fontSize: 13,
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
