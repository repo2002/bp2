import RouteMap from "@/components/carpool/RouteMap";
import EventCardMedium from "@/components/events/EventCardMedium";
import LocationPickerBottomSheet from "@/components/LocationPickerBottomSheet";
import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { getEvents } from "@/services/events";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";

export default function RouteStep({ form, setForm, onBack, onNext }) {
  const theme = useTheme();
  const [showDepartureTime, setShowDepartureTime] = useState(false);
  const [showDestinationTime, setShowDestinationTime] = useState(false);
  const departureSheetRef = useRef();
  const destinationSheetRef = useRef();
  const [routeDuration, setRouteDuration] = useState(null);

  // Event logic
  const [isForEvent, setIsForEvent] = useState(!!form.event_id);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (isForEvent && events.length === 0) {
      setLoadingEvents(true);
      getEvents({ limit: 50, status: "upcoming" })
        .then((res) => setEvents(res.events || []))
        .finally(() => setLoadingEvents(false));
    }
  }, [isForEvent]);

  // When event is picked, set event_id and destination_location
  const handleEventSelect = (event) => {
    setForm((f) => ({
      ...f,
      event_id: event.id,
      destination_location: {
        address: event.location.address,
        latitude: event.location.lat,
        longitude: event.location.lng,
        description: event.location.address,
      },
    }));
    setShowEventModal(false);
  };

  // If user toggles off event, clear event_id and allow destination editing
  useEffect(() => {
    if (!isForEvent) {
      setForm((f) => ({ ...f, event_id: null }));
    }
  }, [isForEvent]);

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

  // Calculate destination time when route duration or departure time changes
  useEffect(() => {
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
  }, [routeDuration, form.departure_time]);

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
        {/* Carpool for Event Switch */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
          <ThemeText style={{ fontSize: 16, marginRight: 10 }}>
            Is this carpool for an event?
          </ThemeText>
          <Switch
            value={isForEvent}
            onValueChange={setIsForEvent}
            thumbColor={isForEvent ? theme.colors.primary : theme.colors.grey}
            trackColor={{
              true: theme.colors.grey,
              false: theme.colors.greyLight,
            }}
          />
        </View>
        {/* Event Picker */}
        {isForEvent && (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: theme.colors.cardBackground,
              marginBottom: 12,
            }}
            onPress={() => setShowEventModal(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.primary}
              style={{ marginRight: 8 }}
            />
            <ThemeText style={{ color: theme.colors.text, fontSize: 16 }}>
              {form.event_id
                ? events.find((e) => e.id === form.event_id)?.title ||
                  "Select Event"
                : "Select Event"}
            </ThemeText>
          </TouchableOpacity>
        )}
        {/* Event Modal */}
        <Modal
          visible={showEventModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEventModal(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0,0,0,0.4)", // semi-transparent overlay
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.background,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 16,
                maxHeight: "70%",
                height: "70%",
                width: "100%",
                alignSelf: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <ThemeText style={{ fontSize: 18, fontWeight: "bold" }}>
                  Select Event
                </ThemeText>
                <TouchableOpacity onPress={() => setShowEventModal(false)}>
                  <Ionicons name="close" size={28} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              {loadingEvents ? (
                <ActivityIndicator
                  size="large"
                  color={theme.colors.primary}
                  style={{ marginTop: 32 }}
                />
              ) : (
                <FlatList
                  data={events}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <EventCardMedium
                      event={item}
                      onPress={() => handleEventSelect(item)}
                    />
                  )}
                  ListEmptyComponent={
                    <ThemeText style={{ textAlign: "center", marginTop: 32 }}>
                      No events found.
                    </ThemeText>
                  }
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </View>
        </Modal>
        {/* Departure Time */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "transparent",
              marginRight: 10,
              alignSelf: "center",
            }}
          />
          <TouchableOpacity
            onPress={() => setShowDepartureTime(true)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: theme.colors.cardBackground,
            }}
          >
            <Ionicons
              name="time-outline"
              size={20}
              color={theme.colors.primary}
              style={{ marginRight: 8 }}
            />
            <ThemeText style={{ color: theme.colors.text, fontSize: 16 }}>
              Departure Time: {formatDateTime(form.departure_time)}
            </ThemeText>
          </TouchableOpacity>
        </View>
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
        {/* Departure Location */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: theme.colors.success,
              marginRight: 10,
              alignSelf: "center",
            }}
          />
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: theme.colors.cardBackground,
            }}
            onPress={() => departureSheetRef.current?.open()}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={theme.colors.success}
              style={{ marginRight: 8 }}
            />
            <ThemeText
              style={{
                color: form.departure_location
                  ? theme.colors.text
                  : theme.colors.grey,
                fontSize: 16,
              }}
            >
              {form.departure_location
                ? form.departure_location.description ||
                  form.departure_location.address
                : "Select Departure Location"}
            </ThemeText>
          </TouchableOpacity>
        </View>

        {/* Destination Location */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: theme.colors.error,
              marginRight: 10,
              alignSelf: "center",
            }}
          />
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: theme.colors.cardBackground,
              opacity: isForEvent ? 0.5 : 1,
            }}
            onPress={() => {
              if (!isForEvent) destinationSheetRef.current?.open();
            }}
            disabled={isForEvent}
          >
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={20}
              color={theme.colors.error}
              style={{ marginRight: 8 }}
            />
            <ThemeText
              style={{
                color: form.destination_location
                  ? theme.colors.text
                  : theme.colors.grey,
                fontSize: 16,
              }}
            >
              {form.destination_location
                ? form.destination_location.description ||
                  form.destination_location.address
                : "Select Destination Location"}
            </ThemeText>
          </TouchableOpacity>
        </View>

        {/* Estimated Arrival */}
        {form.destination_time && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            <Ionicons
              name="flag-outline"
              size={16}
              color={theme.colors.primary}
              style={{ marginRight: 6 }}
            />
            <ThemeText
              style={{
                color: theme.colors.primary,
                fontSize: 15,
                fontWeight: "bold",
              }}
            >
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
            backgroundColor: theme.colors.greyDark,
          }}
          onPress={onBack}
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
        ref={destinationSheetRef}
        initialLocation={form.destination_location}
        onConfirm={(loc) =>
          setForm((f) => ({ ...f, destination_location: loc }))
        }
      />
      <LocationPickerBottomSheet
        ref={departureSheetRef}
        initialLocation={form.departure_location}
        onConfirm={(loc) => setForm((f) => ({ ...f, departure_location: loc }))}
      />
    </View>
  );
}
