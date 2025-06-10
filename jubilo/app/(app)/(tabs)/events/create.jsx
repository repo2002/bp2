import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { createEvent, uploadEventImage } from "@/services/events";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";

import LocationPickerBottomSheet from "@/components/LocationPickerBottomSheet";
import ThemeText from "@/components/theme/ThemeText";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const categories = [
  { id: "party", label: "Party" },
  { id: "meeting", label: "Meeting" },
  { id: "sports", label: "Sports" },
  { id: "music", label: "Music" },
  { id: "food", label: "Food" },
  { id: "festival", label: "Festival" },
  { id: "wedding", label: "Wedding" },
  { id: "reunion", label: "Reunion" },
  { id: "other", label: "Other" },
];

export default function CreateEventScreen() {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: { address: "", lat: null, lng: null },
    start_time: new Date(),
    end_time: new Date(),
    category: "other",
    is_private: false,
    max_participants: "",
    dresscode: "",
    allow_guests_to_post: true,
    status: "upcoming",
  });
  const [selectedImage, setSelectedImage] = useState(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const locationSheetRef = useRef();

  const handleLocationConfirm = (location) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        address: location.description,
        lat: location.latitude,
        lng: location.longitude,
      },
    }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.title) {
        Alert.alert("Error", "Title is required");
        return;
      }
      if (
        !formData.location?.address ||
        !formData.location?.lat ||
        !formData.location?.lng
      ) {
        Alert.alert("Error", "Please select a valid location");
        return;
      }
      if (formData.end_time <= formData.start_time) {
        Alert.alert("Error", "End time must be after start time");
        return;
      }

      // Create event
      const event = await createEvent({ ...formData, status: "upcoming" });

      // Before uploading image
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Upload image if selected
      if (selectedImage) {
        const { success, error } = await uploadEventImage(
          event.id,
          selectedImage.uri,
          true
        );
        if (!success) {
          console.error("Failed to upload event image:", error);
          // Continue anyway since the event was created
        }
      }

      // Add creator as participant
      await supabase.from("event_participants").insert([
        {
          event_id: event.id,
          user_id: user.id,
          status: "going",
        },
      ]);

      // Close the modal (screen) after event creation
      router.back();

      // Navigate to event details
      router.push(`/events/${event.id}`);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDateChange = (event, selectedDate, isStart) => {
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        [isStart ? "start_time" : "end_time"]: selectedDate,
      }));
    }
    if (isStart) {
      setShowStartPicker(false);
    } else {
      setShowEndPicker(false);
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View
            style={[
              styles.step,
              {
                backgroundColor:
                  currentStep >= step
                    ? theme.colors.primary
                    : theme.colors.cardBackground,
                borderColor: theme.colors.text,
              },
            ]}
          >
            <ThemeText
              style={[
                styles.stepText,
                {
                  color:
                    currentStep >= step
                      ? theme.colors.background
                      : theme.colors.text,
                },
              ]}
            >
              {step}
            </ThemeText>
          </View>
          {step < 3 && (
            <View
              style={[
                styles.stepLine,
                {
                  backgroundColor:
                    currentStep > step
                      ? theme.colors.primary
                      : theme.colors.cardBackground,
                },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.stepContent}>
        <ThemeText style={[styles.label, { color: theme.colors.text }]}>
          Cover Image
        </ThemeText>
        <TouchableOpacity
          style={[
            styles.imagePicker,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.text,
            },
          ]}
          onPress={pickImage}
        >
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.selectedImage}
            />
          ) : (
            <ThemeText style={{ color: theme.colors.text }}>
              Add Cover Image
            </ThemeText>
          )}
        </TouchableOpacity>

        <ThemeText style={[styles.label, { color: theme.colors.text }]}>
          Title *
        </ThemeText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.cardBackground,
              color: theme.colors.text,
            },
          ]}
          value={formData.title}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, title: text }))
          }
          placeholder="Event title"
          placeholderTextColor={theme.colors.text}
        />

        <ThemeText style={[styles.label, { color: theme.colors.text }]}>
          Description
        </ThemeText>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: theme.colors.cardBackground,
              color: theme.colors.text,
            },
          ]}
          value={formData.description}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, description: text }))
          }
          placeholder="Event description"
          placeholderTextColor={theme.colors.text}
          multiline
          numberOfLines={4}
        />

        <ThemeText style={[styles.label, { color: theme.colors.text }]}>
          Category
        </ThemeText>
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.text,
                },
                formData.category === category.id && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() =>
                setFormData((prev) => ({ ...prev, category: category.id }))
              }
            >
              <ThemeText
                style={[
                  styles.categoryButtonText,
                  { color: theme.colors.text },
                  formData.category === category.id && {
                    color: theme.colors.background,
                  },
                ]}
              >
                {category.label}
              </ThemeText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <ThemeText style={[styles.label, { color: theme.colors.text }]}>
        Location *
      </ThemeText>
      <TouchableOpacity
        style={[
          styles.input,
          {
            borderWidth: 1,
            borderColor: theme.colors.text,
            backgroundColor: theme.colors.cardBackground,
            color: theme.colors.text,
            zIndex: 10,
            justifyContent: "center",
          },
        ]}
        onPress={() => locationSheetRef.current?.open?.()}
      >
        <ThemeText style={{ color: theme.colors.text }}>
          {formData.location.address
            ? formData.location.address
            : "Add Location"}
        </ThemeText>
      </TouchableOpacity>
      <ThemeText style={[styles.label, { color: theme.colors.text }]}>
        Start Time *
      </ThemeText>
      <TouchableOpacity
        style={[
          styles.dateButton,
          {
            borderColor: theme.colors.text,
            backgroundColor: theme.colors.cardBackground,
          },
        ]}
        onPress={() => setShowStartPicker(true)}
      >
        <ThemeText style={{ color: theme.colors.text }}>
          {formatDateTime(formData.start_time)}
        </ThemeText>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={formData.start_time}
          mode="datetime"
          onChange={(event, date) => handleDateChange(event, date, true)}
        />
      )}

      <ThemeText style={[styles.label, { color: theme.colors.text }]}>
        End Time *
      </ThemeText>
      <TouchableOpacity
        style={[
          styles.dateButton,
          {
            borderColor: theme.colors.text,
            backgroundColor: theme.colors.cardBackground,
          },
        ]}
        onPress={() => setShowEndPicker(true)}
      >
        <ThemeText style={{ color: theme.colors.text }}>
          {formatDateTime(formData.end_time)}
        </ThemeText>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={formData.end_time}
          mode="datetime"
          onChange={(event, date) => handleDateChange(event, date, false)}
        />
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.toggleContainer}>
        <ThemeText style={[styles.label, { color: theme.colors.text }]}>
          Private Event
        </ThemeText>
        <TouchableOpacity
          style={[
            styles.toggle,
            { backgroundColor: theme.colors.text },
            formData.is_private && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() =>
            setFormData((prev) => ({ ...prev, is_private: !prev.is_private }))
          }
        >
          <View
            style={[
              styles.toggleButton,
              { backgroundColor: theme.colors.background },
              formData.is_private && styles.toggleButtonActive,
            ]}
          />
        </TouchableOpacity>
      </View>

      <ThemeText style={[styles.label, { color: theme.colors.text }]}>
        Max Participants
      </ThemeText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.cardBackground,
            color: theme.colors.text,
          },
        ]}
        value={formData.max_participants}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, max_participants: text }))
        }
        placeholder="Maximum number of participants"
        placeholderTextColor={theme.colors.text}
        keyboardType="numeric"
      />

      <ThemeText style={[styles.label, { color: theme.colors.text }]}>
        Dress Code
      </ThemeText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.cardBackground,
            color: theme.colors.text,
          },
        ]}
        value={formData.dresscode}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, dresscode: text }))
        }
        placeholder="Dress code (optional)"
        placeholderTextColor={theme.colors.text}
      />

      <View style={styles.toggleContainer}>
        <ThemeText style={[styles.label, { color: theme.colors.text }]}>
          Allow Guests to Post
        </ThemeText>
        <TouchableOpacity
          style={[
            styles.toggle,
            { backgroundColor: theme.colors.text },
            formData.allow_guests_to_post && {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() =>
            setFormData((prev) => ({
              ...prev,
              allow_guests_to_post: !prev.allow_guests_to_post,
            }))
          }
        >
          <View
            style={[
              styles.toggleButton,
              { backgroundColor: theme.colors.background },
              formData.allow_guests_to_post && styles.toggleButtonActive,
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.title) {
      Alert.alert("Error", "Title is required");
      return;
    }
    if (currentStep === 2) {
      if (
        !formData.location?.address ||
        !formData.location?.lat ||
        !formData.location?.lng
      ) {
        Alert.alert("Error", "Please select a valid location");
        return;
      }
      if (formData.end_time <= formData.start_time) {
        Alert.alert("Error", "End time must be after start time");
        return;
      }
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={{ flex: 1 }}>
          <View
            style={[
              styles.form,
              { backgroundColor: theme.colors.background, flex: 1 },
            ]}
          >
            {renderStepIndicator()}
            {renderStepContent()}
          </View>
          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.backButton,
                  { borderColor: theme.colors.text },
                ]}
                onPress={handleBack}
              >
                <ThemeText
                  style={[styles.buttonText, { color: theme.colors.text }]}
                >
                  Back
                </ThemeText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.nextButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleNext}
            >
              <ThemeText
                style={[styles.buttonText, { color: theme.colors.background }]}
              >
                {currentStep === 3 ? "Create Event" : "Next"}
              </ThemeText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      <LocationPickerBottomSheet
        ref={locationSheetRef}
        initialLocation={
          formData.location.address
            ? {
                latitude: formData.location.lat,
                longitude: formData.location.lng,
                description: formData.location.address,
              }
            : null
        }
        onConfirm={handleLocationConfirm}
        style={{ zIndex: 100 }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },

  form: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  step: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stepText: {
    fontSize: 16,
    fontWeight: "600",
  },
  stepLine: {
    width: 50,
    height: 2,
    marginHorizontal: 5,
  },
  stepContent: {
    marginBottom: 20,
    flexShrink: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 0,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonText: {
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  toggleButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  toggleButtonActive: {
    transform: [{ translateX: 20 }],
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginBottom: 20,
    padding: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  backButton: {
    marginRight: 10,
    borderWidth: 1,
  },
  nextButton: {
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  imagePicker: {
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
