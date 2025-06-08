import ErrorMessage from "@/components/ErrorMessage";
import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { carService } from "@/services/carpool/carService";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddCarScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [carImage, setCarImage] = useState(null);
  const [carDetails, setCarDetails] = useState({
    make: "",
    model: "",
    color: "",
    licensePlate: "",
    seats: "4",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setCarImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setError("Failed to pick image. Please try again.");
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!carDetails.make || !carDetails.model) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const car = {
        ...carDetails,
        seats: parseInt(carDetails.seats, 10),
        image: carImage,
      };

      await carService.createCar(car);

      router.replace("/carpools");
    } catch (err) {
      setError("Failed to save car. Please try again.");
      console.error("Error saving car:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View
        style={[styles.header, { backgroundColor: theme.colors.background }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemeText style={styles.headerTitle}>Add Car</ThemeText>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          style={styles.headerButton}
        >
          <ThemeText color={theme.colors.primary} style={styles.saveButton}>
            {isLoading ? "Saving..." : "Save"}
          </ThemeText>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        {error && <ErrorMessage error={error} />}

        {/* Car Image Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          <ThemeText style={styles.sectionTitle}>Car Image</ThemeText>
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            {carImage ? (
              <Image source={{ uri: carImage }} style={styles.carImage} />
            ) : (
              <View
                style={[
                  styles.imagePlaceholder,
                  { backgroundColor: theme.colors.greyLight },
                ]}
              >
                <Ionicons name="camera" size={32} color={theme.colors.grey} />
                <ThemeText
                  color={theme.colors.grey}
                  style={styles.placeholderText}
                >
                  Add Car Image
                </ThemeText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Car Details Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          <ThemeText style={styles.sectionTitle}>Car Details</ThemeText>

          <View style={styles.inputContainer}>
            <ThemeText style={styles.label}>Make</ThemeText>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={carDetails.make}
              onChangeText={(text) =>
                setCarDetails((prev) => ({ ...prev, make: text }))
              }
              placeholder="Car make"
              placeholderTextColor={theme.colors.grey}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemeText style={styles.label}>Model</ThemeText>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={carDetails.model}
              onChangeText={(text) =>
                setCarDetails((prev) => ({ ...prev, model: text }))
              }
              placeholder="Car model"
              placeholderTextColor={theme.colors.grey}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemeText style={styles.label}>Color</ThemeText>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={carDetails.color}
              onChangeText={(text) =>
                setCarDetails((prev) => ({ ...prev, color: text }))
              }
              placeholder="Car color"
              placeholderTextColor={theme.colors.grey}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemeText style={styles.label}>License Plate</ThemeText>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={carDetails.licensePlate}
              onChangeText={(text) =>
                setCarDetails((prev) => ({ ...prev, licensePlate: text }))
              }
              placeholder="License plate number"
              placeholderTextColor={theme.colors.grey}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemeText style={styles.label}>Number of Seats</ThemeText>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={carDetails.seats}
              onChangeText={(text) =>
                setCarDetails((prev) => ({ ...prev, seats: text }))
              }
              placeholder="Number of passenger seats"
              placeholderTextColor={theme.colors.grey}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
  },
  carImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    fontSize: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.3,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerButton: {
    padding: 8,
  },
});
