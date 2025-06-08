import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { carService } from "@/services/carpool/carService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import EmptyState from "../EmptyState";

export default function CarList({ cars }) {
  const theme = useTheme();
  const [carsWithImages, setCarsWithImages] = useState([]);

  useEffect(() => {
    const loadCarImages = async () => {
      const carsWithUrls = await Promise.all(
        cars.map(async (car) => {
          const imageUrl = await carService.getCarImageUrl(car.image);
          return { ...car, imageUrl };
        })
      );
      setCarsWithImages(carsWithUrls);
    };

    if (cars?.length) {
      loadCarImages();
    }
  }, [cars]);

  // const handleCarPress = (car) => {
  //   router.push(`/cars/${car.id}`);
  // };

  const handleEditCar = (car) => {
    router.push(`/cars/${car.id}/edit`);
  };

  const handleDeleteCar = (car) => {
    Alert.alert("Delete Car", "Are you sure you want to delete this car?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await carService.deleteCar(car.id);
            // Refresh the cars list by triggering a re-render
            setCarsWithImages((prev) => prev.filter((c) => c.id !== car.id));
          } catch (error) {
            Alert.alert("Error", "Failed to delete car. Please try again.");
            console.error("Error deleting car:", error);
          }
        },
      },
    ]);
  };

  if (!cars?.length) {
    return (
      <EmptyState
        message="No Cars Added"
        description="Add your car to start creating carpools"
      />
    );
  }

  const renderCarInfo = (icon, label, value) => (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={20} color={theme.colors.grey} />
      <ThemeText color={theme.colors.grey} style={styles.infoLabel}>
        {label}:
      </ThemeText>
      <ThemeText color={theme.colors.text} style={styles.infoValue}>
        {value}
      </ThemeText>
    </View>
  );

  return (
    <FlatList
      data={carsWithImages}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View
          //onPress={() => handleCarPress(item)}
          style={[styles.carItem]}
        >
          <View
            style={[
              styles.carContent,
              { backgroundColor: theme.colors.cardBackground },
            ]}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.carImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => handleEditCar(item)}
                style={[
                  styles.iconButton,
                  styles.editButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Ionicons name="pencil" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteCar(item)}
                style={[
                  styles.iconButton,
                  styles.deleteButton,
                  { backgroundColor: theme.colors.error },
                ]}
              >
                <Ionicons name="trash" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.carInfo}>
              <ThemeText color={theme.colors.text} style={styles.carName}>
                {item.make} {item.model}
              </ThemeText>

              {renderCarInfo("palette", "Color", item.color)}
              {renderCarInfo("car-door", "Seats", `${item.seats} seats`)}
              {renderCarInfo("card-text", "License Plate", item.license_plate)}
            </View>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    gap: 16,
  },
  carItem: {
    borderRadius: 12,
    padding: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  carContent: {
    flexDirection: "column",
    alignItems: "stretch",
    borderRadius: 12,
  },
  imageContainer: {
    position: "relative",
  },
  carImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  iconButton: {
    position: "absolute",
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editButton: {
    left: 12,
  },
  deleteButton: {
    right: 12,
  },
  carInfo: {
    padding: 16,
    gap: 12,
  },
  carName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
