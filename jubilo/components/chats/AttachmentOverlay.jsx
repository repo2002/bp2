import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  if (!visible) return null;
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.cardBackground,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
        elevation: 8,
        zIndex: 100,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <ThemeText style={{ fontWeight: "bold", fontSize: 18 }}>
          Send Attachment
        </ThemeText>
        <Ionicons
          name="close"
          color={theme.colors.text}
          size={20}
          onPress={onClose}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
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
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: "center",
        margin: 8,
        width: 72,
      }}
    >
      <View
        style={{
          backgroundColor: "#f3f3f3",
          borderRadius: 24,
          width: 48,
          height: 48,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <Ionicons name={icon} size={28} color="#333" />
      </View>
      <ThemeText style={{ fontSize: 13 }}>{label}</ThemeText>
    </TouchableOpacity>
  );
}

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
