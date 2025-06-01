import { useTheme } from "@/hooks/theme";
import { View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export default function GooglePlacesInput({ onPlaceSelected, onInputChange }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <GooglePlacesAutocomplete
        placeholder="Add location"
        predefinedPlaces={[]}
        textInputProps={{
          onChangeText: (text) => {
            if (onInputChange) onInputChange(text);
          },
        }}
        onPress={(data, details = null) => {
          if (onPlaceSelected) {
            onPlaceSelected(data, details);
          }
        }}
        fetchDetails={true}
        minLength={2}
        debounce={300}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "", // fallback if env not injected
          language: "en",
        }}
        styles={{
          textInput: {
            fontSize: 16,
            color: theme.colors.text,
            backgroundColor: theme.colors.cardBackground,
            padding: 0,
            margin: 0,
          },
        }}
        enablePoweredByContainer={false}
        nearbyPlacesAPI="GooglePlacesSearch"
      />
    </View>
  );
}
