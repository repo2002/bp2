import BottomSheetModal from "@/components/BottomSheetModal";
import EventGallery from "@/components/events/EventGallery";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function EventImagesBottomSheet({
  eventId,
  visible,
  onClose,
  images = [],
  canUploadImages = false,
  onUploaded, // callback to refresh images after upload
}) {
  const sheetRef = useRef(null);
  const theme = useTheme();
  const { user } = useAuth();
  const snapPoints = ["70%", "90%"];
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Log when bottom sheet opens
  useEffect(() => {
    if (visible) {
    }
  }, [visible, eventId, user?.id, canUploadImages, images]);

  const handlePickAndUpload = async () => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to upload images");
      return;
    }

    if (!canUploadImages) {
      Alert.alert(
        "Error",
        "You don't have permission to upload images to this event"
      );
      return;
    }

    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.5, // Reduced quality for faster upload
        maxWidth: 1200, // Limit maximum width
        maxHeight: 1200, // Limit maximum height
      });

      if (result.canceled) return;
      setUploading(true);

      const image = result.assets[0];
      const fileExt = image.uri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `event-images/${eventId}/${fileName}`;

      // Read the file as base64 with compression
      const base64 = await FileSystem.readAsStringAsync(image.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Upload to Supabase Storage with cache control
      const { error: uploadError } = await supabase.storage
        .from("events")
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: false,
          cacheControl: "3600", // Cache for 1 hour
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(uploadError.message);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("events").getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }

      // Insert into event_images
      const { error: dbError } = await supabase.from("event_images").insert({
        event_id: eventId,
        image_url: publicUrl,
        user_id: user.id,
      });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(dbError.message);
      }

      setUploading(false);
      onUploaded?.();
    } catch (err) {
      console.error("Upload error:", err);
      setUploading(false);
      setError(err.message || "Failed to upload image");
      Alert.alert("Upload Failed", err.message || "Failed to upload image");
    }
  };

  // Helper function to decode base64
  const decode = (base64) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
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
          {canUploadImages && (
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
