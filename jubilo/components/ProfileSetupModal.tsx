import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Modal,
  Switch,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@clerk/clerk-expo";
import ThemeText from "./ThemeText";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ProfileSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function ProfileSetupModal({
  visible,
  onClose,
  onComplete,
}: ProfileSetupModalProps) {
  const theme = useTheme();
  const { user } = useUser();
  const createUserProfile = useMutation(api.auth.createUserProfile);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(dateOfBirth);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      if (!user) {
        throw new Error("User not found");
      }

      // Update Clerk profile
      await user.update({
        unsafeMetadata: {
          bio,
          dateOfBirth: dateOfBirth.toISOString(),
          isPrivate,
        },
        ...(avatarUrl ? { imageUrl: avatarUrl } : {}),
      });

      // Save to backend database
      await createUserProfile({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        phoneNumber: user.primaryPhoneNumber?.phoneNumber || "",
        imageUrl: avatarUrl,
        username: user.username || "",
        firstname: user.firstName || "",
        lastname: user.lastName || "",
        dateOfBirth: dateOfBirth.getTime(),
      });

      onComplete();
    } catch (err: any) {
      console.error("Failed to update user:", err);
      setError(err?.message || "Failed to save profile details");
    }
  };

  const handleDateConfirm = () => {
    setDateOfBirth(tempDate);
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setTempDate(dateOfBirth);
    setShowDatePicker(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalContainer, { backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <ScrollView style={styles.scrollView}>
            <View style={styles.header}>
              <ThemeText style={styles.title}>Complete Your Profile</ThemeText>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={pickImage}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Ionicons
                      name="person"
                      size={40}
                      color={theme.colors.grey}
                    />
                  </View>
                )}
                <ThemeText style={styles.avatarText}>Tap to change</ThemeText>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Add a bio to your profile"
              multiline
              value={bio}
              onChangeText={setBio}
              style={[styles.bioInput, { color: theme.colors.text }]}
              placeholderTextColor={theme.colors.grey}
            />

            <View style={styles.section}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons
                    name={isPrivate ? "lock-closed" : "lock-open"}
                    size={24}
                    color={theme.colors.primary}
                  />
                  <View>
                    <ThemeText>Private Account</ThemeText>
                    <ThemeText style={styles.settingDescription}>
                      Only visible to followers
                    </ThemeText>
                  </View>
                </View>
                <Switch
                  value={isPrivate}
                  onValueChange={setIsPrivate}
                  trackColor={{
                    true: theme.colors.primary,
                    false: theme.colors.grey,
                  }}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons
                    name="calendar"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <View>
                    <ThemeText>Date of Birth</ThemeText>
                    <ThemeText style={styles.settingDescription}>
                      Not displayed on profile
                    </ThemeText>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <View style={styles.dateButton}>
                    <ThemeText>{dateOfBirth.toLocaleDateString()}</ThemeText>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {error && (
              <ThemeText style={[styles.error, { color: theme.colors.error }]}>
                {error}
              </ThemeText>
            )}

            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.saveButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <ThemeText style={styles.saveButtonText}>Save Profile</ThemeText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <Modal visible={showDatePicker} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                if (selectedDate) setTempDate(selectedDate);
              }}
              style={styles.datePicker}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={handleDateCancel}
                style={[styles.modalButton, { borderColor: theme.colors.grey }]}
              >
                <ThemeText>Cancel</ThemeText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDateConfirm}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <ThemeText style={{ color: "white" }}>Confirm</ThemeText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
    color: "#666",
  },
  bioInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: "top",
  },
  section: {
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 8,
    borderRadius: 8,
  },
  saveButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: {
    marginTop: 10,
    textAlign: "center",
  },
  datePicker: {
    width: "100%",
    height: 200,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    borderWidth: 1,
  },
});
