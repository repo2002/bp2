import GooglePlacesInput from "@/components/GooglePlacesInput";
import { useTheme } from "@/hooks/theme";
import React, { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import BottomSheetModal from "./BottomSheetModal";

const LocationPickerBottomSheet = React.forwardRef(
  ({ initialLocation, onConfirm }, ref) => {
    const [location, setLocation] = useState(initialLocation || null);
    const theme = useTheme();
    const snapPoints = useMemo(() => ["70%"]);
    const handlePlaceSelected = (data, details) => {
      console.log("LocationPickerBottomSheet - handlePlaceSelected:", {
        data,
        details,
      });
      try {
        if (details && details.geometry && details.geometry.location) {
          const newLocation = {
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            description: data.description,
          };
          console.log("Setting new location:", newLocation);
          setLocation(newLocation);
        } else {
          console.warn("Invalid location data received:", { data, details });
        }
      } catch (error) {
        console.error("Error in handlePlaceSelected:", error);
      }
    };

    const handleConfirm = () => {
      console.log("LocationPickerBottomSheet - handleConfirm:", location);
      try {
        if (location) {
          onConfirm(location);
          ref.current?.close();
        } else {
          console.warn("No location selected");
        }
      } catch (error) {
        console.error("Error in handleConfirm:", error);
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        title="Pick a Location"
        showConfirm={true}
        confirmText="Set Location"
        onConfirm={handleConfirm}
        keyboardBehavior="extend"
      >
        <GooglePlacesInput onPlaceSelected={handlePlaceSelected} />
        {location && (
          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={location} />
          </MapView>
        )}
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 12,
  },
});

export default LocationPickerBottomSheet;
