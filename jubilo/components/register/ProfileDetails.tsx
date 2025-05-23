import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Modal,
  Switch,
  SafeAreaView,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@clerk/clerk-expo";
import ThemeText from "../ThemeText";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useForm } from "@/contexts/FormContext";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ProfileDetails({ onNext, prev }: any) {
  const { formData, setFormData } = useForm();
  const theme = useTheme();
  const { user } = useUser();

  const convexUser = useQuery(api.profile.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  const updateUser = useMutation(api.profile.updateUser);

  const [isDark, setIsDark] = useState(false);
  const [bio, setBio] = useState(formData.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(formData.avatarUrl || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()
  );
  const [isPrivate, setIsPrivate] = useState(formData.isPrivate || false);
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
      aspect: [1, 1], // Square aspect ratio for avatar
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
      if (!user || !convexUser) return null;

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
      await updateUser({
        userId: convexUser?._id,
        fields: {
          email: formData.email,
          phoneNumber: formData.phoneNumber || "",
          imageUrl: avatarUrl,
          username: formData.username,
          firstname: formData.firstName,
          lastname: formData.lastName,
          dateOfBirth: dateOfBirth.getTime(),
          updatedAt: Date.now(),
        },
      });

      // Update form context
      setFormData({
        ...formData,
        bio,
        avatarUrl,
        dateOfBirth: dateOfBirth.toISOString(),
        isPrivate,
      });

      onNext();
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

  const handleBack = () => {
    prev();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: "space-between",
          padding: 16,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={{
              flexDirection: "column",
              gap: 0,

              paddingBottom: 8,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* top container */}
              <TouchableOpacity
                onPress={pickImage}
                style={styles.avatarContainer}
              >
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 100,
                      borderWidth: 1,
                      borderColor: theme.colors.grey,
                    }}
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
                <ThemeText
                  style={[
                    styles.avatarText,
                    { color: theme.colors.grey, fontSize: 12 },
                  ]}
                >
                  Tap to change
                </ThemeText>
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "column",
                  flex: 1,
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <View
                  style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
                >
                  <Ionicons
                    name={isPrivate ? "lock-closed" : "lock-open"}
                    size={18}
                    color={theme.colors.primary}
                  />
                  <ThemeText style={{ fontSize: 18, fontWeight: "bold" }}>
                    {formData.firstName} {formData.lastName}
                  </ThemeText>
                </View>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <View style={{ flexDirection: "column", gap: 4 }}>
                    <ThemeText style={{ fontSize: 20, fontWeight: "bold" }}>
                      23
                    </ThemeText>
                    <ThemeText color={theme.colors.grey}>Posts</ThemeText>
                  </View>
                  <View style={{ flexDirection: "column", gap: 4 }}>
                    <ThemeText style={{ fontSize: 20, fontWeight: "bold" }}>
                      3k
                    </ThemeText>
                    <ThemeText color={theme.colors.grey}>Followers</ThemeText>
                  </View>
                  <View style={{ flexDirection: "column", gap: 4 }}>
                    <ThemeText style={{ fontSize: 20, fontWeight: "bold" }}>
                      2.7k
                    </ThemeText>
                    <ThemeText color={theme.colors.grey}>Following</ThemeText>
                  </View>
                </View>
              </View>
            </View>
            <TextInput
              placeholder="(Tap to change) Add a bio to your profile"
              multiline
              value={bio}
              onChangeText={setBio}
              style={[{ color: theme.colors.text, marginBottom: 32 }]}
              placeholderTextColor={theme.colors.greyDark}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              gap: 16,
              padding: 16,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.cardBackground,
              marginBottom: 32,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 16,
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
                borderBottomWidth: 0.3,
                borderColor: theme.colors.primary,
                paddingBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={isPrivate ? "lock-closed" : "lock-open"}
                  size={28}
                  color={theme.colors.primary}
                />
                <View style={{ flexDirection: "column", gap: 4 }}>
                  <ThemeText style={{ fontSize: 16 }}>
                    Private account
                  </ThemeText>

                  <ThemeText color={theme.colors.grey} style={{ fontSize: 12 }}>
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

            <View
              style={{
                flexDirection: "row",
                gap: 16,
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="calendar"
                  size={28}
                  color={theme.colors.primary}
                />
                <View style={{ flexDirection: "column", gap: 4 }}>
                  <ThemeText style={{ fontSize: 16 }}>Date of birth</ThemeText>

                  <ThemeText color={theme.colors.grey} style={{ fontSize: 12 }}>
                    Not displayed on profile
                  </ThemeText>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View
                  style={[
                    {
                      borderColor: theme.colors.grey,
                      borderWidth: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                    },
                  ]}
                >
                  <ThemeText>{dateOfBirth.toLocaleDateString()}</ThemeText>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
          >
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
                    style={[
                      styles.modalButton,
                      { borderColor: theme.colors.grey },
                    ]}
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
        </KeyboardAvoidingView>
        <TouchableOpacity
          onPress={() => {
            handleSave();
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 10,
            backgroundColor: theme.colors.invertedBackground,
            padding: 16,
            width: "100%",
          }}
        >
          <ThemeText
            color={theme.colors.invertedText}
            style={{ fontWeight: "bold", fontSize: 16 }}
          >
            Next
          </ThemeText>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.invertedText}
            style={{ marginRight: 8 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            handleBack();
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 10,
            backgroundColor: theme.colors.invertedBackground,
            padding: 16,
            width: "100%",
          }}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={theme.colors.invertedText}
            style={{ marginLeft: 8 }}
          />
          <ThemeText
            color={theme.colors.invertedText}
            style={{ fontWeight: "bold", fontSize: 16 }}
          >
            Back
          </ThemeText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
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
