import { useTheme } from "@/hooks/theme";
import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const RouteMap = ({ departure, destination, style }) => {
  const theme = useTheme();
  const mapRef = useRef(null);
  const [travelTime, setTravelTime] = useState(null);
  const [distance, setDistance] = useState(null);

  // Default to Tel Aviv if no locations provided
  const initialRegion = {
    latitude: 32.0853,
    longitude: 34.7818,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const origin = departure
    ? { latitude: departure.latitude, longitude: departure.longitude }
    : null;
  const dest = destination
    ? { latitude: destination.latitude, longitude: destination.longitude }
    : null;

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={origin || initialRegion}
        mapType="standard"
        //customMapStyle={myCustomStyle}

        showsMyLocationButton={false}
        zoomEnabled={false}
        scrollEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {origin && (
          <Marker
            coordinate={origin}
            title="Departure"
            description={departure?.address}
            pinColor={theme.colors.primary}
          />
        )}
        {dest && (
          <Marker
            coordinate={dest}
            title="Destination"
            description={destination?.address}
            pinColor={theme.colors.error}
          />
        )}
        {origin && dest && (
          <MapViewDirections
            origin={origin}
            destination={dest}
            apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}
            strokeWidth={5}
            strokeColor="black"
            onReady={(result) => {
              setTravelTime(result.duration);
              setDistance(result.distance);
              // Fit the map to the route
              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                animated: true,
              });
            }}
            onError={(error) => {
              setTravelTime(null);
              setDistance(null);
            }}
          />
        )}
      </MapView>
      {/* {travelTime && (
        <ThemeText style={styles.info}>
          Estimated travel time: {Math.round(travelTime)} min
          {distance ? ` • ${distance.toFixed(1)} km` : ""}
        </ThemeText>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  info: {
    position: "absolute",
    bottom: 8,
    left: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "#fff",
    padding: 6,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 13,
  },
});

export default RouteMap;
