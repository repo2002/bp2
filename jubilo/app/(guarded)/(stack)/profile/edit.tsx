import ThemeText from "@/components/ThemeText";
import { api } from "@/convex/_generated/api";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";

export default function EditProfile() {
  const theme = useTheme();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convexUser = useQuery(api.profile.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  const [bio, setBio] = useState(convexUser?.bio || "");
  const [isPrivate, setIsPrivate] = useState(convexUser?.isPrivate || false);
  const [dateOfBirth, setDateOfBirth] = useState(convexUser?.dateOfBirth || "");
  const [avatarUrl, setAvatarUrl] = useState(convexUser?.imageUrl || "");
  const [firstname, setFirstname] = useState(convexUser?.firstname || "");
  const [lastname, setLastname] = useState(convexUser?.lastname || "");

  const updateUser = useMutation(api.profile.updateUser);

  if (!convexUser) return null;

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatarUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setError("Failed to pick image");
    }
  };

  const handleSave = async () => {
    try {
      console.log("Starting save...", {
        firstname,
        lastname,
        bio,
        dateOfBirth,
        avatarUrl,
        isPrivate,
        userId: convexUser?._id,
      });

      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error("User not found");
      }
      if (!user || !convexUser) {
        console.log("No user or convexUser found");
        return null;
      }

      console.log("Updating Clerk profile...");
      // Update Clerk profile
      await user.update({
        unsafeMetadata: {
          bio,
          dateOfBirth: dateOfBirth
            ? new Date(dateOfBirth).getTime()
            : undefined,
          isPrivate,
        },
      });

      // Update profile image separately if it has changed
      if (avatarUrl && avatarUrl !== convexUser.imageUrl) {
        try {
          // Read the file as base64
          const base64 = await FileSystem.readAsStringAsync(avatarUrl, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Convert base64 to blob
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "image/jpeg" });

          // Create a File object
          const file = new File([blob], "profile-image.jpg", {
            type: "image/jpeg",
          });

          // Update the profile image
          await user.setProfileImage({ file });
        } catch (error) {
          console.error("Failed to update profile image:", error);
          // Continue with the rest of the update even if image update fails
        }
      }

      console.log("Updating Convex database...");
      // Save to backend database
      const result = await updateUser({
        userId: convexUser._id,
        fields: {
          bio,
          imageUrl: avatarUrl,
          firstname: firstname,
          lastname: lastname,
          dateOfBirth: dateOfBirth
            ? new Date(dateOfBirth).getTime()
            : undefined,
          isPrivate,
          updatedAt: Date.now(),
        },
      });
      console.log("Update result:", result);

      console.log("Save successful, navigating back...");
      router.back();
    } catch (error: any) {
      console.error("Save failed:", error);
      setError(error?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = useMutation(api.profile.deleteUser);
  const handleDelete = async () => {
    if (!convexUser?._id) return;
    setLoading(true);
    try {
      Alert.alert(
        "Delete Account",
        "Are you sure you want to delete your account?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await deleteUser({ userId: convexUser._id });
              router.replace("/(auth)/login");
            },
          },
        ]
      );
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {loading && <ActivityIndicator />}
      {error && (
        <ThemeText style={{ color: theme.colors.error, padding: 16 }}>
          {error}
        </ThemeText>
      )}
      <View style={{ padding: 16, gap: 24 }}>
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity onPress={pickImage}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: theme.colors.primary,
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.cardBackground,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="person"
                  size={60}
                  color={theme.colors.primary}
                />
              </View>
            )}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: theme.colors.primary,
                borderRadius: 20,
                padding: 8,
              }}
            >
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <ThemeText
              style={{ marginBottom: 8, fontSize: 16, fontWeight: "500" }}
            >
              First Name
            </ThemeText>
            <TextInput
              value={firstname}
              onChangeText={setFirstname}
              style={{
                backgroundColor: theme.colors.cardBackground,
                padding: 12,
                borderRadius: 12,
                color: theme.colors.text,
                fontSize: 16,
              }}
              placeholderTextColor={theme.colors.grey}
            />
          </View>

          <View>
            <ThemeText
              style={{ marginBottom: 8, fontSize: 16, fontWeight: "500" }}
            >
              Last Name
            </ThemeText>
            <TextInput
              value={lastname}
              onChangeText={setLastname}
              style={{
                backgroundColor: theme.colors.cardBackground,
                padding: 12,
                borderRadius: 12,
                color: theme.colors.text,
                fontSize: 16,
              }}
              placeholderTextColor={theme.colors.grey}
            />
          </View>

          <View>
            <ThemeText
              style={{ marginBottom: 8, fontSize: 16, fontWeight: "500" }}
            >
              Bio
            </ThemeText>
            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: theme.colors.cardBackground,
                padding: 12,
                borderRadius: 12,
                color: theme.colors.text,
                fontSize: 16,
                minHeight: 100,
                textAlignVertical: "top",
              }}
              placeholderTextColor={theme.colors.grey}
            />
          </View>

          <View>
            <ThemeText
              style={{ marginBottom: 8, fontSize: 16, fontWeight: "500" }}
            >
              Date of Birth
            </ThemeText>
            <TextInput
              value={
                dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : ""
              }
              onChangeText={(text) => setDateOfBirth(new Date(text).getTime())}
              style={{
                backgroundColor: theme.colors.cardBackground,
                padding: 12,
                borderRadius: 12,
                color: theme.colors.text,
                fontSize: 16,
              }}
              placeholderTextColor={theme.colors.grey}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <ThemeText style={{ fontSize: 16, fontWeight: "500" }}>
              Private Profile
            </ThemeText>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{
                false: theme.colors.grey,
                true: theme.colors.primary,
              }}
            />
          </View>
        </View>

        <View style={{ gap: 16, marginTop: 24 }}>
          <TouchableOpacity
            onPress={handleSave}
            style={{
              alignItems: "center",
              padding: 16,
              borderRadius: 16,
              backgroundColor: theme.colors.primary,
            }}
          >
            <ThemeText
              color="white"
              style={{ fontSize: 18, fontWeight: "bold" }}
            >
              Save Changes
            </ThemeText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={{
              alignItems: "center",
              padding: 16,
              borderRadius: 16,
              backgroundColor: theme.colors.cardBackground,
              borderWidth: 1,
              borderColor: theme.colors.error,
            }}
          >
            <ThemeText
              color={theme.colors.error}
              style={{ fontSize: 18, fontWeight: "bold" }}
            >
              Delete Account
            </ThemeText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
