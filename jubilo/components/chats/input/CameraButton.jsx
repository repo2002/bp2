import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

const CameraButton = ({ onPress, theme }) => (
  <TouchableOpacity onPress={onPress} style={{ marginHorizontal: 4 }}>
    <Ionicons name="camera" size={24} color={theme.colors.text} />
  </TouchableOpacity>
);

export default CameraButton;
