import RouteMap from "@/components/carpool/RouteMap";
import LocationPickerBottomSheet from "@/components/LocationPickerBottomSheet";
import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function RouteStep({ form, setForm, onBack, onNext }) {
  const theme = useTheme();
  const [showDepartureTime, setShowDepartureTime] = useState(false);
  const [showDestinationTime, setShowDestinationTime] = useState(false);
  const departureSheetRef = useRef();
  const destinationSheetRef = useRef();
  const [routeDuration, setRouteDuration] = useState(null);

  const isValid =
    form.departure_location &&
    form.departure_time &&
    form.destination_location &&
    form.destination_time;

  // Format date/time without seconds
  const formatDateTime = (date) =>
    date
      ? date.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "Select";

  // When routeDuration and departure_time are set, calculate destination_time
  if (
    routeDuration &&
    form.departure_time &&
    (!form.destination_time ||
      Math.abs(
        form.destination_time.getTime() -
          (form.departure_time.getTime() + routeDuration * 60 * 1000)
      ) > 60000) // update if off by more than 1 min
  ) {
    const arrival = new Date(
      form.departure_time.getTime() + routeDuration * 60 * 1000
    );
    setForm((f) => ({ ...f, destination_time: arrival }));
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <ThemeText style={{ fontSize: 18, fontWeight: "600", padding: 16 }}>
          Route Details
        </ThemeText>
        <ThemeText
          color={theme.colors.grey}
          style={{ fontSize: 16, fontWeight: "600", padding: 16 }}
        >
          Step 2/4
        </ThemeText>
      </View>
      {/* Content */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 80,
        }}
      >
        {/* Departure Location */}
        <TouchableOpacity
          style={{
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            backgroundColor: theme.colors.cardBackground,
          }}
          onPress={() => departureSheetRef.current?.open()}
        >
          <ThemeText
            style={{
              color: form.departure_location
                ? theme.colors.text
                : theme.colors.grey,
            }}
          >
            {form.departure_location
              ? form.departure_location.description ||
                form.departure_location.address
              : "Select Departure Location"}
          </ThemeText>
        </TouchableOpacity>

        {/* Departure Time */}
        <TouchableOpacity
          onPress={() => setShowDepartureTime(true)}
          style={{
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            backgroundColor: theme.colors.cardBackground,
          }}
        >
          <ThemeText style={{ color: theme.colors.text }}>
            Departure Time: {formatDateTime(form.departure_time)}
          </ThemeText>
        </TouchableOpacity>
        {showDepartureTime && (
          <DateTimePicker
            value={form.departure_time || new Date()}
            mode="datetime"
            display="default"
            onChange={(_, date) => {
              setShowDepartureTime(false);
              if (date) setForm((f) => ({ ...f, departure_time: date }));
            }}
          />
        )}
        {/* Destination Location */}
        <TouchableOpacity
          style={{
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            backgroundColor: theme.colors.cardBackground,
          }}
          onPress={() => destinationSheetRef.current?.open()}
        >
          <ThemeText
            style={{
              color: form.destination_location
                ? theme.colors.text
                : theme.colors.grey,
            }}
          >
            {form.destination_location
              ? form.destination_location.description ||
                form.destination_location.address
              : "Select Destination Location"}
          </ThemeText>
        </TouchableOpacity>
        {form.destination_time && (
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <ThemeText style={{ color: theme.colors.text, fontSize: 15 }}>
              Estimated Arrival: {formatDateTime(form.destination_time)}
            </ThemeText>
          </View>
        )}

        {/* Small Map Preview */}
        <View>
          <RouteMap
            departure={form.departure_location}
            destination={form.destination_location}
            height={160}
            style={{ borderRadius: 12 }}
            onRouteInfo={({ duration }) => setRouteDuration(duration)}
          />
          {/* Show calculated destination time if available */}
        </View>
      </View>
      {/* Navigation Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 16,
          backgroundColor: theme.colors.background,
        }}
      >
        <TouchableOpacity
          style={{
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 10,
            alignItems: "center",
            backgroundColor: theme.colors.grey,
          }}
          onPress={onBack}
        >
          <ThemeText color="white" style={{ fontWeight: "bold", fontSize: 16 }}>
            Back
          </ThemeText>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 10,
            alignItems: "center",
            backgroundColor: isValid ? theme.colors.primary : theme.colors.grey,
          }}
          onPress={isValid ? onNext : undefined}
          disabled={!isValid}
        >
          <ThemeText color="white" style={{ fontWeight: "bold", fontSize: 16 }}>
            Next
          </ThemeText>
        </TouchableOpacity>
      </View>
      <LocationPickerBottomSheet
        ref={departureSheetRef}
        initialLocation={form.departure_location}
        onConfirm={(loc) => setForm((f) => ({ ...f, departure_location: loc }))}
      />

      <LocationPickerBottomSheet
        ref={destinationSheetRef}
        initialLocation={form.destination_location}
        onConfirm={(loc) =>
          setForm((f) => ({ ...f, destination_location: loc }))
        }
      />
    </View>
  );
}
