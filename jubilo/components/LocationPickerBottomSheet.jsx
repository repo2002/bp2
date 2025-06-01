import GooglePlacesInput from "@/components/GooglePlacesInput";
import { useTheme } from "@/hooks/theme";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import BottomSheetModal from "./BottomSheetModal";

const LocationPickerBottomSheet = React.forwardRef(
  ({ initialLocation, onConfirm }, ref) => {
    const [location, setLocation] = useState(initialLocation || null);
    const theme = useTheme();

    const handlePlaceSelected = (data, details) => {
      if (details && details.geometry && details.geometry.location) {
        setLocation({
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          description: data.description,
        });
      }
    };

    const handleConfirm = () => {
      onConfirm(location);
      ref.current?.close();
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={["50%", "80%"]}
        title="Pick a Location"
        showConfirm={true}
        confirmText="Set Location"
        onConfirm={handleConfirm}
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
