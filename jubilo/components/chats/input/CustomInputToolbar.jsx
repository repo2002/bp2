import { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import { InputToolbar } from "react-native-gifted-chat";
import AttachmentButton from "./AttachmentButton";
import CameraButton from "./CameraButton";
import CustomComposer from "./CustomComposer";
import VoiceNoteButton from "./VoiceNoteButton";

const CustomInputToolbar = (props) => {
  const { theme, text, onPressAttachment, onPressCamera, onPressVoice } = props;
  const hasText = !!text && text.trim().length > 0;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: theme.colors.cardBackground,
        borderTopWidth: 0,
        paddingHorizontal: keyboardVisible ? 0 : 12,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingBottom: keyboardVisible ? 8 : 12,
        marginTop: 4,
      }}
      primaryStyle={{
        alignItems: "center",
        flexDirection: "row",
        flex: 1,
      }}
    >
      {/* Text Input */}
      <CustomComposer {...props} theme={theme} />
      {/* Buttons on the right */}
      <AttachmentButton onPress={onPressAttachment} theme={theme} />
      {!hasText && (
        <>
          <CameraButton onPress={onPressCamera} theme={theme} />
          <VoiceNoteButton onPress={onPressVoice} theme={theme} />
        </>
      )}
    </InputToolbar>
  );
};

export default CustomInputToolbar;
