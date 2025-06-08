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
          returnKeyType: "search",
          blurOnSubmit: false,
        }}
        onPress={(data, details = null) => {
          console.log("Place selected:", { data, details });
          if (onPlaceSelected) {
            try {
              onPlaceSelected(data, details);
            } catch (error) {
              console.error("Error in onPlaceSelected:", error);
            }
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
          container: {
            flex: 1,
          },
          textInput: {
            fontSize: 16,
            color: theme.colors.text,
            backgroundColor: theme.colors.cardBackground,
            padding: 0,
            margin: 0,
          },
          listView: {
            backgroundColor: theme.colors.cardBackground,
            position: "absolute",
            top: 45,
            left: 0,
            right: 0,
            zIndex: 1000,
          },
          row: {
            backgroundColor: theme.colors.cardBackground,
            padding: 13,
            height: "auto",
            minHeight: 44,
          },
          description: {
            color: theme.colors.text,
          },
          separator: {
            height: 0.5,
            backgroundColor: theme.colors.greyLight,
          },
        }}
        enablePoweredByContainer={false}
        nearbyPlacesAPI="GooglePlacesSearch"
        onFail={(error) =>
          console.error("GooglePlacesAutocomplete error:", error)
        }
        listViewDisplayed="auto"
        keepResultsAfterBlur={true}
      />
    </View>
  );
}
