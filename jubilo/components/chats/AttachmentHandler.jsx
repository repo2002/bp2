import { sendAttachment } from "@/services/chatService";
import { Audio } from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";

export default function AttachmentHandler({
  roomId,
  userId,
  onAttachmentSent,
  onError,
}) {
  const handleAttachment = useCallback(
    async (type) => {
      if (!userId || !roomId) return;
      try {
        let result;
        switch (type) {
          case "image": {
            const { status } =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              onError(
                "Sorry, we need camera roll permissions to make this work!"
              );
              return;
            }
            result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled) {
              const asset = result.assets[0];
              const { success, error } = await sendAttachment(
                roomId,
                userId,
                {
                  uri: asset.uri,
                  type: asset.type || "image/jpeg",
                  name: asset.fileName || "image.jpg",
                  size: asset.fileSize,
                },
                "image"
              );
              if (!success) onError("Error sending image: " + error);
              else onAttachmentSent();
            }
            break;
          }
          case "video": {
            const { status } =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              onError(
                "Sorry, we need camera roll permissions to make this work!"
              );
              return;
            }
            result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Videos,
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled) {
              const asset = result.assets[0];
              const { success, error } = await sendAttachment(
                roomId,
                userId,
                {
                  uri: asset.uri,
                  type: asset.type || "video/mp4",
                  name: asset.fileName || "video.mp4",
                  size: asset.fileSize,
                  duration: asset.duration,
                  thumbnail: asset.uri, // Optionally generate a thumbnail
                },
                "video"
              );
              if (!success) onError("Error sending video: " + error);
              else onAttachmentSent();
            }
            break;
          }
          case "camera": {
            const { status } =
              await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              onError("Sorry, we need camera permissions to make this work!");
              return;
            }
            result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled) {
              const asset = result.assets[0];
              const fileType = asset.type?.startsWith("video")
                ? "video"
                : "image";
              const { success, error } = await sendAttachment(
                roomId,
                userId,
                {
                  uri: asset.uri,
                  type:
                    asset.type ||
                    (fileType === "video" ? "video/mp4" : "image/jpeg"),
                  name:
                    asset.fileName ||
                    (fileType === "video" ? "video.mp4" : "image.jpg"),
                  size: asset.fileSize,
                  duration: asset.duration,
                  thumbnail: asset.uri,
                },
                fileType
              );
              if (!success) onError(`Error sending ${fileType}: ` + error);
              else onAttachmentSent();
            }
            break;
          }
          case "audio": {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== "granted") {
              onError(
                "Sorry, we need microphone permissions to make this work!"
              );
              return;
            }
            let recorder;
            try {
              recorder = new Audio.Recorder();
              await recorder.prepareToRecordAsync({
                android: {
                  extension: ".m4a",
                  outputFormat: "MPEG_4",
                  audioEncoder: "AAC",
                  sampleRate: 44100,
                  numberOfChannels: 2,
                  bitRate: 128000,
                },
                ios: {
                  extension: ".m4a",
                  audioQuality: "high",
                  sampleRate: 44100,
                  numberOfChannels: 2,
                  bitRate: 128000,
                },
              });
              await recorder.startAsync();
              alert("Recording... Press OK to stop.");
              await recorder.stopAndUnloadAsync();
              const uri = recorder.getURI();
              if (uri) {
                const { success, error } = await sendAttachment(
                  roomId,
                  userId,
                  {
                    uri,
                    type: "audio/m4a",
                    name: "voice.m4a",
                  },
                  "audio"
                );
                if (!success) onError("Error sending audio: " + error);
                else onAttachmentSent();
              }
            } catch (err) {
              onError("Error recording audio: " + err.message);
            }
            break;
          }
          case "document": {
            const result = await DocumentPicker.getDocumentAsync({
              type: "*/*",
              copyToCacheDirectory: true,
              multiple: false,
            });
            if (result.type === "success") {
              const { uri, mimeType, name, size } = result;
              const { success, error } = await sendAttachment(
                roomId,
                userId,
                {
                  uri,
                  type: mimeType,
                  name,
                  size,
                },
                "document"
              );
              if (!success) onError("Error sending document: " + error);
              else onAttachmentSent();
            }
            break;
          }
          default:
            onError("Unsupported attachment type: " + type);
        }
      } catch (error) {
        onError("Error handling attachment: " + error.message);
      }
    },
    [roomId, userId, onAttachmentSent, onError]
  );

  return null; // This component doesn't render anything
}
