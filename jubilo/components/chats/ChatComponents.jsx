import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import {
  Avatar,
  Bubble,
  Composer,
  InputToolbar,
  Send,
  SystemMessage,
} from "react-native-gifted-chat";

// Generate 25 distinct colors for group chat members
const generateGroupColors = () => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B59B6",
    "#3498DB",
    "#E67E22",
    "#2ECC71",
    "#E74C3C",
    "#1ABC9C",
    "#F1C40F",
    "#34495E",
    "#16A085",
    "#D35400",
    "#2980B9",
    "#8E44AD",
    "#27AE60",
    "#C0392B",
    "#F39C12",
    "#7F8C8D",
    "#BDC3C7",
    "#2C3E50",
    "#95A5A6",
  ];
  return colors;
};

const GROUP_COLORS = generateGroupColors();

export const CustomBubble = (props) => {
  const { theme, currentMessage, previousMessage, nextMessage } = props;
  const isFirstInSequence =
    !previousMessage ||
    !previousMessage.user ||
    !currentMessage ||
    !currentMessage.user ||
    previousMessage.user._id !== currentMessage.user._id;
  const isLastInSequence =
    !nextMessage ||
    !nextMessage.user ||
    !currentMessage ||
    !currentMessage.user ||
    nextMessage.user._id !== currentMessage.user._id;

  return (
    <Bubble
      {...props}
      renderUsernameOnMessage={false}
      wrapperStyle={{
        left: {
          backgroundColor: theme.colors.cardBackground,
          borderRadius: 16,
          padding: 8,
          marginLeft: isFirstInSequence ? 0 : 40,
        },
        right: {
          backgroundColor: theme.colors.primary,
          borderRadius: 16,
          padding: 8,
        },
      }}
      textStyle={{
        left: { color: theme.colors.text },
        right: { color: "white" },
      }}
      renderTime={() => (
        <Text
          style={{
            fontSize: 10,
            color: theme.colors.grey,
            magrinTop: 4,
          }}
        >
          {new Date(currentMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      )}
    />
  );
};

export const CustomAvatar = (props) => {
  const { currentMessage, previousMessage } = props;
  const isFirstInSequence =
    !previousMessage || previousMessage.user._id !== currentMessage.user._id;

  if (!isFirstInSequence) return null;

  return (
    <Avatar
      {...props}
      containerStyle={{
        left: { marginRight: 0 },
        right: { marginLeft: 0 },
      }}
      imageStyle={{
        width: 32,
        height: 32,
        borderRadius: 16,
      }}
    />
  );
};

export const CustomInputToolbar = (props) => {
  const { theme, text, onPressAttachment, onPressMedia, onPressVoice } = props;
  const hasText = !!text && text.trim().length > 0;

  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: theme.colors.cardBackground,
        borderTopWidth: 0,
        borderRadius: 100,
        marginHorizontal: 8,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 0,
        marginTop: 4,
      }}
      primaryStyle={{
        alignItems: "center",
        flexDirection: "row",
        flex: 1,
      }}
    >
      {/* Text Input */}
      <Composer {...props} theme={theme} />
      {/* Buttons on the right */}
      <AttachmentButton onPress={onPressAttachment} theme={theme} />
      {!hasText && (
        <>
          <MediaPickerButton onPress={onPressMedia} theme={theme} />
          <VoiceNoteButton onPress={onPressVoice} theme={theme} />
        </>
      )}
    </InputToolbar>
  );
};

export const CustomComposer = (props) => {
  const { theme } = props;
  return (
    <Composer
      {...props}
      textInputStyle={{
        color: theme.colors.text,
        fontSize: 16,
      }}
      placeholderTextColor={theme.colors.grey}
    />
  );
};

export const CustomSend = (props) => {
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

export const AttachmentButton = ({ onPress, theme }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 28,
        height: 28,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
      }}
    >
      <Ionicons name="add" size={20} color={"white"} />
    </TouchableOpacity>
  );
};

export const TypingIndicator = ({ typingUsers, theme }) => {
  if (!typingUsers?.length) return null;
  return (
    <View
      style={{
        backgroundColor: theme.colors.cardBackground,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginHorizontal: 8,
        marginBottom: 4,
      }}
    >
      <Text style={{ color: theme.colors.grey, fontSize: 12 }}>
        {typingUsers.length === 1
          ? `${typingUsers[0]} is typing...`
          : `${typingUsers.length} people are typing...`}
      </Text>
    </View>
  );
};

export const getGroupMemberColor = (userId) => {
  // Use the user's ID to consistently assign a color
  const index =
    userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    GROUP_COLORS.length;
  return GROUP_COLORS[index];
};

export const MediaPickerButton = ({ onPress, theme }) => (
  <TouchableOpacity onPress={onPress} style={{ marginHorizontal: 4 }}>
    <Ionicons name="image" size={24} color={theme.colors.text} />
  </TouchableOpacity>
);

export const VoiceNoteButton = ({ onPress, theme }) => (
  <TouchableOpacity onPress={onPress} style={{ marginHorizontal: 4 }}>
    <Ionicons name="mic" size={24} color={theme.colors.text} />
  </TouchableOpacity>
);

export const CustomSystemMessage = (props) => (
  <SystemMessage
    {...props}
    containerStyle={{ backgroundColor: "pink" }}
    wrapperStyle={{ borderWidth: 10, borderColor: "white" }}
    textStyle={{ color: "crimson", fontWeight: "900" }}
  />
);
