import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

const VoiceNoteButton = ({ onPress, theme }) => (
  <TouchableOpacity onPress={onPress} style={{ marginHorizontal: 4 }}>
    <Ionicons name="mic" size={24} color={theme.colors.text} />
  </TouchableOpacity>
);

export default VoiceNoteButton;
