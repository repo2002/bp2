import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Send } from "react-native-gifted-chat";

const CustomSend = (props) => {
  const { theme } = props;
  return (
    <Send
      {...props}
      containerStyle={{
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.primary,
          width: 32,
          height: 32,
          borderRadius: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="send" size={16} color="white" />
      </View>
    </Send>
  );
};

export default CustomSend;
