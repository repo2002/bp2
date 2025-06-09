import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

const AttachmentButton = ({ onPress, theme }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 26,
        height: 26,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
        marginRight: 4,
      }}
    >
      <Ionicons name="add" size={20} color={"white"} />
    </TouchableOpacity>
  );
};

export default AttachmentButton;
