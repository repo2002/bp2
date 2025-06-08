import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

export default function SummaryStep({
  form,
  selectedCar,
  onBack,
  onSubmit,
  submitting,
  error,
}) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <ThemeText style={{ fontSize: 18, fontWeight: "600", padding: 16 }}>
          Review & Submit
        </ThemeText>
        <ThemeText
          color={theme.colors.grey}
          style={{ fontSize: 16, fontWeight: "600", padding: 16 }}
        >
          Summary
        </ThemeText>
      </View>
      {/* Content */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 80,
        }}
      >
        {/* Car */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Ionicons
            name="car-outline"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
          <ThemeText style={{ fontSize: 16, color: theme.colors.text }}>
            {selectedCar
              ? `${selectedCar.make} ${selectedCar.model} (${selectedCar.license_plate})`
              : "No car selected"}
          </ThemeText>
        </View>
        {/* Route */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={theme.colors.success}
            style={{ marginRight: 10 }}
          />
          <ThemeText style={{ fontSize: 16, color: theme.colors.text }}>
            {form.departure_location?.description ||
              form.departure_location?.address ||
              "-"}
          </ThemeText>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={20}
            color={theme.colors.error}
            style={{ marginRight: 10 }}
          />
          <ThemeText style={{ fontSize: 16, color: theme.colors.text }}>
            {form.destination_location?.description ||
              form.destination_location?.address ||
              "-"}
          </ThemeText>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
          <ThemeText style={{ fontSize: 16, color: theme.colors.text }}>
            Departure:{" "}
            {form.departure_time ? form.departure_time.toLocaleString() : "-"}
          </ThemeText>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Ionicons
            name="flag-outline"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
          <ThemeText style={{ fontSize: 16, color: theme.colors.text }}>
            Arrival:{" "}
            {form.destination_time
              ? form.destination_time.toLocaleString()
              : "-"}
          </ThemeText>
        </View>
        {/* Seats & Pricing */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Ionicons
            name="people-outline"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
          <ThemeText style={{ fontSize: 16, color: theme.colors.text }}>
            Max Seats: {form.max_seats}
          </ThemeText>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <MaterialCommunityIcons
            name="currency-usd"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
          <ThemeText style={{ fontSize: 16, color: theme.colors.text }}>
            Price: {form.price || "-"}
          </ThemeText>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <MaterialCommunityIcons
            name="cash-multiple"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
          <ThemeText style={{ fontSize: 16, color: theme.colors.text }}>
            Cost: {form.cost || "-"}
          </ThemeText>
        </View>
        {/* Description */}
        {form.description ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 10,
            }}
          >
            <Ionicons
              name="document-text-outline"
              size={20}
              color={theme.colors.primary}
              style={{ marginRight: 10, marginTop: 2 }}
            />
            <ThemeText style={{ fontSize: 16, color: theme.colors.text }}>
              {form.description}
            </ThemeText>
          </View>
        ) : null}
        {/* Options */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
          <ThemeText style={{ fontSize: 16, color: theme.colors.text }}>
            {form.is_private ? "Private Carpool" : "Public Carpool"}
          </ThemeText>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <MaterialCommunityIcons
            name="calendar-repeat"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
          <ThemeText style={{ fontSize: 16, color: theme.colors.text }}>
            {form.is_recurring
              ? `Recurring: ${form.recurrence_rule || "(no rule)"}`
              : "Not Recurring"}
          </ThemeText>
        </View>
        {/* Error */}
        {error && (
          <ThemeText style={{ color: theme.colors.error, marginVertical: 8 }}>
            {error}
          </ThemeText>
        )}
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
          disabled={submitting}
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
            backgroundColor: theme.colors.primary,
            opacity: submitting ? 0.7 : 1,
          }}
          onPress={onSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemeText
              color="white"
              style={{ fontWeight: "bold", fontSize: 16 }}
            >
              Create Carpool
            </ThemeText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
