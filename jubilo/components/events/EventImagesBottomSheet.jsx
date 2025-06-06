import BottomSheetModal from "@/components/BottomSheetModal";
import EventGallery from "@/components/events/EventGallery";
import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function EventImagesBottomSheet({
  eventId,
  visible,
  onClose,
  images = [],
  canUpload = false,
  onUploaded, // callback to refresh images after upload
}) {
  const sheetRef = useRef(null);
  const theme = useTheme();
  const snapPoints = ["70%", "90%"];
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handlePickAndUpload = async () => {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (result.canceled) return;
      setUploading(true);
      const image = result.assets[0];
      const fileExt = image.uri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `event-images/${eventId}/${fileName}`;
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("events")
        .upload(filePath, {
          uri: image.uri,
          type: `image/${fileExt}`,
          name: fileName,
        });
      if (uploadError) throw uploadError;
      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("events").getPublicUrl(filePath);
      // Insert into event_images
      const { error: dbError } = await supabase.from("event_images").insert({
        event_id: eventId,
        image_url: publicUrl,
      });
      if (dbError) throw dbError;
      setUploading(false);
      onUploaded?.();
    } catch (err) {
      setUploading(false);
      setError(err.message || "Failed to upload image");
    }
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      title="Event Images"
      visible={visible}
      onClose={onClose}
      style={styles.sheetContent}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: 0,
          margin: 0,
        }}
      >
        <View style={styles.container}>
          {canUpload && (
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handlePickAndUpload}
                disabled={uploading}
              >
                <Ionicons
                  name="add-circle"
                  size={32}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              {uploading && (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
          )}
          {error && (
            <ThemeText
              style={{
                color: theme.colors.error,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {error}
            </ThemeText>
          )}
          <EventGallery images={images} />
          {!images.length && !uploading && (
            <ThemeText
              style={{
                textAlign: "center",
                color: theme.colors.textSecondary,
              }}
            >
              No images yet.
            </ThemeText>
          )}
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    padding: 0,
  },
  container: {
    flex: 1,
    padding: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 8,
    zIndex: 10,
  },
  addBtn: {
    padding: 4,
    borderRadius: 16,
  },
});
