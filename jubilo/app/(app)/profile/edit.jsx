import Avatar from "@/components/Avatar";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import { getUserImageSource, uploadFile } from "@/services/imageService";
import { updateUserData } from "@/services/userService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const EditProfile = () => {
  const insets = useSafeAreaInsets();
  const { user, setAuth, setUserData } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  // State for form fields
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    phone_number: user?.phone_number || "",
    is_private: user?.is_private || false,
    image_url: user?.image_url || null,
  });

  // State to track if form has changes
  const [hasChanges, setHasChanges] = useState(false);

  // Keep only the useEffect for tracking changes
  useEffect(() => {
    const hasFormChanges = Object.keys(formData).some(
      (key) => formData[key] !== user?.[key]
    );
    setHasChanges(hasFormChanges);
  }, [formData, user]);

  const validateForm = () => {
    // Check first name and last name
    if (!formData.first_name.trim()) {
      Alert.alert("Error", "First name cannot be empty");
      return false;
    }
    if (!formData.last_name.trim()) {
      Alert.alert("Error", "Last name cannot be empty");
      return false;
    }

    // Check username
    if (!formData.username.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      // Validate form before saving
      if (!validateForm()) return;

      // Format username with @ symbol
      const formattedData = {
        ...formData,
        username: `@${formData.username.replace(/^@/, "")}`, // Remove any existing @ and add one
      };

      const res = await updateUserData(user.id, formattedData);
      if (res.success) {
        setUserData({
          ...formattedData,
          image_url: formattedData.image_url,
        });
        router.back();
      } else {
        Alert.alert("Error", res.msg);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error saving profile:", error.message);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImagePicker = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        selectionLimit: 1,
        multiple: false,
      });

      if (!result.canceled) {
        setIsLoading(true); // Show loading state

        // Upload image
        const uploadResult = await uploadFile(
          "profiles",
          result.assets[0].uri,
          true
        );

        if (uploadResult.success) {
          // Update form data with new image URL
          setFormData((prev) => ({
            ...prev,
            image_url: uploadResult.data,
          }));

          // Force hasChanges to true since we've updated the image
          setHasChanges(true);
        } else {
          Alert.alert("Error", "Failed to upload image. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error picking/uploading image:", error);
      Alert.alert(
        "Error",
        "Failed to update profile picture. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  let imageSource =
    user.image_url && typeof user.image_url == "object"
      ? user.image_url.uri
      : getUserImageSource(user.image_url);

  return (
    <View style={{ paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
          borderBottomWidth: 0.2,
          borderBottomColor: theme.colors.greyDark,
          paddingBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemeText style={{ fontSize: 16 }}>Edit Profile</ThemeText>
        <TouchableOpacity onPress={handleSave} disabled={!hasChanges}>
          <ThemeText
            color={hasChanges ? theme.colors.primary : theme.colors.greyLight}
            style={{ fontSize: 16 }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              "Save"
            )}
          </ThemeText>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          marginBottom: 16,
        }}
      >
        <Avatar
          size={120}
          uri={formData.image_url || user?.image_url}
          style={{
            borderWidth: 3,
            borderColor: user?.is_verified ? "gold" : "transparent",
          }}
        />
        <TouchableOpacity onPress={handleImagePicker}>
          <ThemeText color={theme.colors.primary} style={{ fontSize: 12 }}>
            Edit profile picture
          </ThemeText>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: "column", gap: 16, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <ThemeText style={styles.labelColumn}>First name</ThemeText>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                fontSize: 16,
                borderBottomColor: theme.colors.text,
              },
            ]}
            placeholder="Enter first name"
            placeholderTextColor={theme.colors.text}
            value={formData.first_name}
            onChangeText={(value) => handleInputChange("first_name", value)}
          />
        </View>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <ThemeText style={styles.labelColumn}>Last name</ThemeText>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderBottomColor: theme.colors.text,
              },
            ]}
            placeholder="Enter last name"
            placeholderTextColor={theme.colors.text}
            value={formData.last_name}
            onChangeText={(value) => handleInputChange("last_name", value)}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 16 }}>
          <ThemeText style={styles.labelColumn}>Username</ThemeText>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <ThemeText style={{ color: theme.colors.text }}>@</ThemeText>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  borderBottomColor: theme.colors.text,
                  marginLeft: 4,
                },
              ]}
              placeholder="Enter username"
              placeholderTextColor={theme.colors.text}
              autoCapitalize="none"
              value={formData.username.replace(/^@/, "")}
              onChangeText={(value) =>
                handleInputChange("username", value.replace(/^@/, ""))
              }
            />
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <ThemeText style={styles.labelColumn}>Bio</ThemeText>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderBottomColor: theme.colors.text,
              },
            ]}
            placeholder="Enter bio"
            placeholderTextColor={theme.colors.text}
            multiline
            numberOfLines={3}
            maxLength={200}
            value={formData.bio}
            onChangeText={(value) => handleInputChange("bio", value)}
          />
        </View>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <ThemeText style={styles.labelColumn}>Email</ThemeText>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderBottomColor: theme.colors.text,
              },
            ]}
            placeholder="Enter email"
            placeholderTextColor={theme.colors.text}
            keyboardType="email-address"
            autoCapitalize="none"
            value={user.email}
            editable={false}
          />
        </View>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <ThemeText style={styles.labelColumn}>Phone</ThemeText>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderBottomColor: theme.colors.text,
              },
            ]}
            placeholder="Enter phone number"
            placeholderTextColor={theme.colors.text}
            keyboardType="phone-pad"
            autoCapitalize="none"
            value={formData.phone_number}
            onChangeText={(value) => handleInputChange("phone_number", value)}
          />
        </View>
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            padding: 16,
            backgroundColor: theme.colors.cardBackground,
            borderRadius: 16,
            borderWidth: 0.2,
            borderColor: theme.colors.primary,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              borderBottomWidth: 0.2,
              borderBottomColor: theme.colors.primary,
              paddingBottom: 8,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                flex: 1,
              }}
            >
              <MaterialCommunityIcons
                name={formData.is_private ? "lock" : "lock-open"}
                size={16}
                color={theme.colors.primary}
              />
              <ThemeText style={{ fontSize: 16 }}>Private account</ThemeText>
            </View>
            <Switch
              value={formData.is_private}
              onValueChange={(value) => handleInputChange("is_private", value)}
              trackColor={{
                true: theme.colors.primary,
                false: theme.colors.greyLight,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 4,
              width: "100%",
            }}
          >
            {formData.is_private ? (
              <>
                <ThemeText style={{ fontSize: 12 }}>
                  * People must send you follow requests
                </ThemeText>
                <ThemeText style={{ fontSize: 12 }}>
                  * Only accepted followers can view your posts
                </ThemeText>
                <ThemeText style={{ fontSize: 12 }}>
                  * Only accepted followers can message you
                </ThemeText>
              </>
            ) : (
              <>
                <ThemeText style={{ fontSize: 12 }}>
                  * Anyone can follow you instantly
                </ThemeText>
                <ThemeText style={{ fontSize: 12 }}>
                  * Everyone can view your posts
                </ThemeText>
                <ThemeText style={{ fontSize: 12 }}>
                  * Followers you accept automatically will now be able to
                  message you
                </ThemeText>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
  },
  logoutButton: {
    padding: 16,
  },
  labelColumn: {
    width: 100,
    paddingVertical: 8,
    fontSize: 16,
  },
  input: {
    flex: 1,
    padding: 0,
    paddingVertical: 8,
    borderBottomWidth: 0.2,
  },
});
