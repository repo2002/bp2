import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

const Section = ({ title, children, icon }) => {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.greyLight,
        }}
      >
        {icon}
        <ThemeText
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: theme.colors.text,
            marginLeft: 8,
          }}
        >
          {title}
        </ThemeText>
      </View>
      <View style={{ paddingLeft: 28 }}>{children}</View>
    </View>
  );
};

const InfoRow = ({ icon, label, value, color }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      {icon}
      <View style={{ flex: 1, marginLeft: 10 }}>
        <ThemeText
          style={{
            fontSize: 14,
            color: theme.colors.grey,
            marginBottom: 2,
          }}
        >
          {label}
        </ThemeText>
        <ThemeText
          style={{
            fontSize: 16,
            color: color || theme.colors.text,
            fontWeight: "500",
          }}
        >
          {value}
        </ThemeText>
      </View>
    </View>
  );
};

export default function SummaryStep({
  form,
  selectedCar,
  onBack,
  onSubmit,
  submitting,
  error,
}) {
  const theme = useTheme();

  const formatDateTime = (date) => {
    if (!date) return "-";
    return format(new Date(date), "MMM d, h:mm a");
  };

  const getRecurringText = () => {
    if (!form.is_recurring) return "Not Recurring";
    if (!form.recurrence_rule) return "Recurring (no schedule)";

    const [freq, days] = form.recurrence_rule.split(";");
    const frequency = freq.replace("FREQ=", "");
    const selectedDays = days.replace("BYDAY=", "").split(",");

    const dayLabels = {
      MO: "Mon",
      TU: "Tue",
      WE: "Wed",
      TH: "Thu",
      FR: "Fri",
      SA: "Sat",
      SU: "Sun",
    };

    const formattedDays = selectedDays.map((day) => dayLabels[day]).join(", ");
    return `${
      frequency.charAt(0).toUpperCase() + frequency.slice(1).toLowerCase()
    }: ${formattedDays}`;
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
        {/* Event Section */}
        {form.event_id && (
          <Section
            title="Event"
            icon={
              <Ionicons
                name="calendar"
                size={24}
                color={theme.colors.primary}
              />
            }
          >
            <InfoRow
              icon={
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              }
              label="Event"
              value={form.event_title}
            />
            <InfoRow
              icon={
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              }
              label="Event Time"
              value={formatDateTime(form.event_time)}
            />
          </Section>
        )}

        {/* Vehicle Section */}
        <Section
          title="Vehicle"
          icon={<Ionicons name="car" size={24} color={theme.colors.primary} />}
        >
          <InfoRow
            icon={
              <Ionicons
                name="car-outline"
                size={20}
                color={theme.colors.primary}
              />
            }
            label="Vehicle"
            value={
              selectedCar
                ? `${selectedCar.make} ${selectedCar.model}`
                : "No car selected"
            }
          />
          {selectedCar && (
            <InfoRow
              icon={
                <MaterialCommunityIcons
                  name="license"
                  size={20}
                  color={theme.colors.primary}
                />
              }
              label="License Plate"
              value={selectedCar.license_plate}
            />
          )}
        </Section>

        {/* Route Section */}
        <Section
          title="Route"
          icon={<Ionicons name="map" size={24} color={theme.colors.primary} />}
        >
          <InfoRow
            icon={
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.colors.success}
              />
            }
            label="Departure"
            value={
              form.departure_location?.description ||
              form.departure_location?.address ||
              "-"
            }
          />
          <InfoRow
            icon={
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={20}
                color={theme.colors.error}
              />
            }
            label="Destination"
            value={
              form.destination_location?.description ||
              form.destination_location?.address ||
              "-"
            }
          />
          <InfoRow
            icon={
              <Ionicons
                name="time-outline"
                size={20}
                color={theme.colors.primary}
              />
            }
            label="Departure Time"
            value={formatDateTime(form.departure_time)}
          />
          <InfoRow
            icon={
              <Ionicons
                name="flag-outline"
                size={20}
                color={theme.colors.primary}
              />
            }
            label="Estimated Arrival"
            value={formatDateTime(form.destination_time)}
          />
        </Section>

        {/* Details Section */}
        <Section
          title="Details"
          icon={
            <Ionicons
              name="information-circle"
              size={24}
              color={theme.colors.primary}
            />
          }
        >
          <InfoRow
            icon={
              <Ionicons
                name="people-outline"
                size={20}
                color={theme.colors.primary}
              />
            }
            label="Available Seats"
            value={form.max_seats?.toString() || "-"}
          />
          <InfoRow
            icon={
              <MaterialCommunityIcons
                name="currency-usd"
                size={20}
                color={theme.colors.primary}
              />
            }
            label="Price per Seat"
            value={form.price ? `€${form.price}` : "-"}
          />
          <InfoRow
            icon={
              <MaterialCommunityIcons
                name="cash-multiple"
                size={20}
                color={theme.colors.primary}
              />
            }
            label="Total Cost"
            value={form.cost ? `€${form.cost}` : "-"}
          />
          {form.description && (
            <InfoRow
              icon={
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              }
              label="Description"
              value={form.description}
            />
          )}
        </Section>

        {/* Options Section */}
        <Section
          title="Options"
          icon={
            <Ionicons name="options" size={24} color={theme.colors.primary} />
          }
        >
          <InfoRow
            icon={
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.primary}
              />
            }
            label="Visibility"
            value={form.is_private ? "Private" : "Public"}
          />
          <InfoRow
            icon={
              <MaterialCommunityIcons
                name="calendar-refresh"
                size={20}
                color={theme.colors.primary}
              />
            }
            label="Schedule"
            value={getRecurringText()}
          />
        </Section>

        {/* Error */}
        {error && (
          <ThemeText
            color={theme.colors.error}
            style={{
              textAlign: "center",
            }}
          >
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
            backgroundColor: theme.colors.greyDark,
          }}
          onPress={onBack}
          disabled={submitting}
        >
          <ThemeText color="black" style={{ fontWeight: "bold", fontSize: 16 }}>
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
    </ScrollView>
  );
}
