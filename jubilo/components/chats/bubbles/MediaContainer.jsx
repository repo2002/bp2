import { View } from "react-native";

const MediaContainer = ({ isCurrentUser, width, height, children }) => (
  <View
    style={{
      width,
      height,
      borderTopLeftRadius: isCurrentUser ? 10 : 0,
      borderTopRightRadius: isCurrentUser ? 10 : 0,
    }}
  >
    {children}
  </View>
);

export default MediaContainer;
