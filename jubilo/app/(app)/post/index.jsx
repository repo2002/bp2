import ImagePickerBottomSheet from "@/components/ImagePickerBottomSheet";
import LocationPickerBottomSheet from "@/components/LocationPickerBottomSheet";
import RichTextEditor from "@/components/RichTextEditor";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { getShortContent } from "@/helpers/common";
import { useTheme } from "@/hooks/theme";
import { createOrUpdatePost } from "@/services/postService";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function isEditorContentEmpty(html) {
  // Remove all tags and whitespace
  return html.replace(/<[^>]*>/g, "").trim().length === 0;
}

const NewPost = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [content, setContent] = useState("");
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [imageAssets, setImageAssets] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef(null);
  const safeAreaInsets = useSafeAreaInsets();
  const imageSheetRef = useRef(null);
  const locationSheetRef = useRef(null);

  const [isPrivate, setIsPrivate] = useState(
    user.is_private === true ? true : false
  );

  const isPostDisabled =
    (isEditorContentEmpty(content) && imageAssets.length === 0) ||
    loading ||
    uploading;
  const postButtonColor = loading
    ? theme.colors.grey
    : isPostDisabled
    ? theme.colors.grey
    : theme.colors.primary;

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    console.log("content:", newContent);
  }, []);

  const handleDeleteMedia = (url, index) => {
    setImageAssets(imageAssets.filter((_, i) => i !== index));
    setSelectedAssets(selectedAssets.filter((_, i) => i !== index));
  };

  const handleDeleteLocation = () => {
    setLocation(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() && imageAssets.length === 0) return;

    try {
      setLoading(true);
      console.log("Submitting post with:", {
        contentLength: content.length,
        imageCount: imageAssets.length,
        hasLocation: !!location,
        isPrivate,
      });

      const { success, error, details } = await createOrUpdatePost({
        content,
        image_urls: imageAssets,
        location,
        is_private: isPrivate,
        user_id: user?.id,
      });

      if (!success) {
        console.error("Failed to create post:", {
          error,
          details,
          postData: {
            contentLength: content.length,
            imageCount: imageAssets.length,
            hasLocation: !!location,
          },
        });
        // You might want to show an error message to the user here
        return;
      }

      router.back();
    } catch (error) {
      console.error("Error in handleSubmit:", {
        message: error.message,
        stack: error.stack,
        postData: {
          contentLength: content.length,
          imageCount: imageAssets.length,
          hasLocation: !!location,
        },
      });
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: safeAreaInsets.top },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.grey }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemeText style={styles.headerTitle}>New Post</ThemeText>
        <TouchableOpacity onPress={handleSubmit} disabled={isPostDisabled}>
          <ThemeText
            color={postButtonColor}
            style={[
              styles.postButton,
              isPostDisabled && styles.disabled,
              loading && { fontStyle: "italic" },
            ]}
          >
            {loading ? "Posting..." : "Post"}
          </ThemeText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <RichTextEditor
          content={content}
          setContent={setContent}
          editor={editorRef}
        />
        <View style={[styles.mediaSection, {}]}>
          <View style={{ flexDirection: "column", gap: 8 }}>
            {/* Image picker bottom sheet trigger */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => imageSheetRef.current?.open()}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  padding: 16,
                  borderRadius: 8,
                  backgroundColor: theme.colors.cardBackground,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Ionicons name="image" size={24} color={theme.colors.text} />
                  <ThemeText style={{ fontSize: 16 }}>
                    Add up to 6 images
                  </ThemeText>
                </View>
                {uploading && (
                  <View style={styles.uploadingContainer}>
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                    />
                    <ThemeText
                      style={{ marginLeft: 8, color: theme.colors.grey }}
                    >
                      Uploading images...
                    </ThemeText>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            {imageAssets.length > 0 && (
              <View style={styles.mediaContainer}>
                {imageAssets.map((url, index) => (
                  <View
                    key={`${url}-${index}`}
                    style={{ position: "relative" }}
                  >
                    <TouchableOpacity
                      onPress={() => handleDeleteMedia(url, index)}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        padding: 4,
                        zIndex: 100,
                      }}
                    >
                      <Ionicons
                        name="trash"
                        size={15}
                        color={theme.colors.error}
                      />
                    </TouchableOpacity>
                    <Image
                      source={typeof url === "string" ? { uri: url } : url}
                      style={styles.mediaPreview}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                ))}
              </View>
            )}
            {/* Location picker bottom sheet trigger */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 8,
                backgroundColor: theme.colors.cardBackground,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <TouchableOpacity
                  onPress={() => locationSheetRef.current?.open()}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Ionicons
                    name="location"
                    size={24}
                    color={theme.colors.text}
                  />
                  <ThemeText style={{ fontSize: 16 }}>
                    {location
                      ? getShortContent(location.description, 30)
                      : "Add location"}
                  </ThemeText>
                </TouchableOpacity>
              </View>
              {location && (
                <TouchableOpacity onPress={handleDeleteLocation}>
                  <Ionicons name="trash" size={24} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 8,
                backgroundColor: theme.colors.cardBackground,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setIsPrivate(!isPrivate)}
                >
                  <Ionicons
                    name={isPrivate ? "lock-closed" : "lock-open"}
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
                <ThemeText style={{ fontSize: 16 }}>
                  {isPrivate ? "Private" : "Public"}
                </ThemeText>
              </View>
              <Switch
                onValueChange={() => setIsPrivate(!isPrivate)}
                value={isPrivate}
                thumbColor={{
                  false: theme.colors.grey,
                  true: theme.colors.primary,
                }}
                trackColor={{
                  false: theme.colors.grey,
                  true: theme.colors.primary,
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sheet Modals */}
      <ImagePickerBottomSheet
        ref={imageSheetRef}
        initialSelected={selectedAssets}
        onConfirm={(assets) => {
          setSelectedAssets(assets);
          const urls = assets.map((asset) =>
            typeof asset === "string" ? asset : asset.uri
          );
          setImageAssets(urls);
        }}
      />
      <LocationPickerBottomSheet
        ref={locationSheetRef}
        initialLocation={location}
        onConfirm={(loc) => setLocation(loc)}
      />
    </View>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 0.2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  postButton: {
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    flexDirection: "column",
    padding: 16,
  },

  actions: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },

  mediaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  mediaPreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
});
