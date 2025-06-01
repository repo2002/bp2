import { useTheme } from "@/hooks/theme";
import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  actions,
  RichEditor,
  RichToolbar,
} from "react-native-pell-rich-editor";

const RichTextEditor = ({ content, setContent, editor }) => {
  const theme = useTheme();

  const handleChange = useCallback(
    (text) => {
      setContent(text);
    },
    [setContent]
  );

  const editorStyle = useMemo(
    () => ({
      color: theme.colors.text,
      placeholderColor: theme.colors.grey,
      backgroundColor: theme.colors.background,
      contentCSSText: `font-size: 16px; color: ${theme.colors.text};`,
    }),
    [theme.colors]
  );

  return (
    <View style={{ minHeight: 100, marginBottom: 16 }}>
      <View
        style={[
          styles.editorContainer,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.greyDark,
            borderWidth: 1,
            borderRadius: 10,
            minHeight: 200,
          },
        ]}
      >
        <RichToolbar
          getEditor={() => editor.current}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.setStrikethrough,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.insertLink,
            actions.alignCenter,
            actions.alignLeft,
          ]}
          style={[
            styles.toolbar,
            {
              backgroundColor: theme.colors.cardBackground,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            },
          ]}
          iconTint={theme.colors.text}
          selectedIconTint={theme.colors.primary}
          disabledIconTint={theme.colors.grey}
          disabled={false}
        />
        <RichEditor
          ref={editor}
          initialContentHTML={content}
          onChange={handleChange}
          placeholder="What's on your mind?"
          style={[styles.editor, { backgroundColor: theme.colors.background }]}
          editorStyle={editorStyle}
        />
      </View>
    </View>
  );
};

export default RichTextEditor;

const styles = StyleSheet.create({
  editorContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
  },
  toolbar: {
    // No border or radius here
  },
  editor: {
    // No border or radius here
  },
});
