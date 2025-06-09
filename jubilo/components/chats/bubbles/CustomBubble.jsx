import { Bubble } from "react-native-gifted-chat";
import CustomMessageContent from "./CustomMessageContent";

const CustomBubble = (props) => {
  const { theme, currentMessage, currentUserId } = props;
  // Determine if this is a media message
  const isMedia = ["image", "video"].includes(currentMessage.type);
  const isCurrentUser = currentMessage.user._id === currentUserId;

  return (
    <Bubble
      {...props}
      renderCustomView={(bubbleProps) => (
        <CustomMessageContent
          {...bubbleProps}
          theme={theme}
          currentUserId={currentUserId}
        />
      )}
      renderUsernameOnMessage={false}
      wrapperStyle={{
        left:
          currentMessage.type === "invitation"
            ? {
                backgroundColor: "transparent",
                padding: 0,
                marginLeft: 4,
                marginBottom: 4,
              }
            : isMedia
            ? {
                backgroundColor: "transparent",
                padding: 0,
                marginLeft: 4,
                marginBottom: 4,
              }
            : {
                backgroundColor: theme.colors.cardBackground,
                marginLeft: 4,
                marginBottom: 4,
              },
        right:
          currentMessage.type === "invitation"
            ? {
                backgroundColor: "transparent",
                padding: 0,
                marginBottom: 4,
                marginRight: 4,
              }
            : isMedia
            ? {
                backgroundColor: "transparent",
                padding: 0,
                marginRight: 4,
                marginBottom: 4,
              }
            : {
                backgroundColor: theme.colors.primary,
                marginBottom: 4,
                marginRight: 4,
              },
      }}
      renderTime={() => null}
      renderMessageText={() => null}
    />
  );
};

export default CustomBubble;
