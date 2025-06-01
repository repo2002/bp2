import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";

export const getUserImageSource = (imagePath) => {
  if (imagePath) {
    return { uri: imagePath };
  }
  return require("@/assets/images/default-avatar.png");
};

export const uploadFile = async (folderName, fileUri, isImage = true) => {
  try {
    let fileName = getFilePath(folderName, isImage);
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    let imageData = decode(fileBase64);

    // Upload to Supabase storage
    let { data, error } = await supabase.storage
      .from("avatar")
      .upload(fileName, imageData, {
        contentType: isImage ? "image/*" : "video/*",
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error(error);
      return { success: false, error: error.message, data: null };
    }

    // Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatar").getPublicUrl(data.path);

    console.log("File uploaded successfully:", publicUrl);
    return { success: true, data: publicUrl };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, error: error.message };
  }
};

export const getFilePath = (folderName, isImage) => {
  return `${folderName}/${new Date().getTime()}.${isImage ? "jpg" : "mp4"}`;
};

export const downloadFile = async (url) => {
  try {
    const uri = await FileSystem.downloadAsync(url, getLocalFilePath(url));
    return uri.uri;
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

export const getLocalFilePath = (filePath) => {
  const fileName = filePath.split("/").pop();
  return `${FileSystem.documentDirectory}${fileName}`;
};
