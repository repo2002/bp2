import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";

const DAYS_OF_WEEK = [
  { id: "MO", label: "Monday" },
  { id: "TU", label: "Tuesday" },
  { id: "WE", label: "Wednesday" },
  { id: "TH", label: "Thursday" },
  { id: "FR", label: "Friday" },
  { id: "SA", label: "Saturday" },
  { id: "SU", label: "Sunday" },
];

const FREQUENCIES = [
  { id: "WEEKLY", label: "Weekly" },
  { id: "BIWEEKLY", label: "Every 2 weeks" },
  { id: "MONTHLY", label: "Monthly" },
];

export default function OptionsStep({ form, setForm, onBack, onNext }) {
  const theme = useTheme();
  const { user } = useAuth();
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [userEvents, setUserEvents] = useState([]);
  const [selectedDays, setSelectedDays] = useState(
    form.recurrence_rule?.split(";")[1]?.replace("BYDAY=", "").split(",") || []
  );
  const [selectedFrequency, setSelectedFrequency] = useState(
    form.recurrence_rule?.split(";")[0]?.replace("FREQ=", "") || "WEEKLY"
  );

  const isValid = true;

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const fetchUserEvents = async () => {
    try {
      const { data: events, error } = await supabase
        .from("event_participants")
        .select(
          `
          event:events (
            id,
            title,
            start_time,
            end_time,
            location
          )
        `
        )
        .eq("user_id", user.id)
        .eq("status", "going");

      if (error) throw error;

      setUserEvents(events.map((e) => e.event));
    } catch (error) {
      console.error("Error fetching user events:", error);
    }
  };

  const handleDayToggle = (dayId) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const handleFrequencyChange = (frequency) => {
    setSelectedFrequency(frequency);
  };

  const handleSaveRecurring = () => {
    if (selectedDays.length > 0) {
      setForm((f) => ({
        ...f,
        recurrence_rule: `FREQ=${selectedFrequency};BYDAY=${selectedDays.join(
          ","
        )}`,
      }));
    }
    setShowRecurringModal(false);
  };

  const handleEventSelect = (event) => {
    setForm((f) => ({
      ...f,
      event_id: event.id,
      event_title: event.title,
      event_time: event.start_time,
    }));
    setShowEventModal(false);
  };

  const getRecurringDisplayText = () => {
    if (!form.is_recurring || !form.recurrence_rule) return "Select schedule";

    const frequency = FREQUENCIES.find(
      (f) => f.id === selectedFrequency
    )?.label;
    const days = selectedDays
      .map((day) => DAYS_OF_WEEK.find((d) => d.id === day)?.label)
      .filter(Boolean)
      .join(", ");

    return `${frequency}: ${days}`;
  };

  const getEventDisplayText = () => {
    if (!form.event_id) return "Select event";
    const event = userEvents.find((e) => e.id === form.event_id);
    if (!event) return "Select event";
    return `${event.title} (${format(
      new Date(event.start_time),
      "MMM d, h:mm a"
    )})`;
  };

  const getLocationText = (location) => {
    if (!location) return "";
    if (typeof location === "string") return location;
    if (typeof location === "object" && location.address)
      return location.address;
    return "";
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <ThemeText style={{ fontSize: 18, fontWeight: "600", padding: 16 }}>
          Options
        </ThemeText>
        <ThemeText
          color={theme.colors.grey}
          style={{ fontSize: 16, fontWeight: "600", padding: 16 }}
        >
          Step 4/4
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
        {/* Event Selection */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            padding: 12,
            backgroundColor: theme.colors.cardBackground,
            borderRadius: 10,
          }}
          onPress={() => setShowEventModal(true)}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
          <ThemeText
            style={{
              flex: 1,
              fontSize: 16,
              color: form.event_id ? theme.colors.text : theme.colors.grey,
            }}
          >
            {getEventDisplayText()}
          </ThemeText>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.grey}
          />
        </TouchableOpacity>

        {/* Private Carpool */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
          <ThemeText
            style={{ flex: 1, fontSize: 16, color: theme.colors.text }}
          >
            Private Carpool
          </ThemeText>
          <Switch
            value={form.is_private}
            onValueChange={(v) => setForm((f) => ({ ...f, is_private: v }))}
            trackColor={{
              false: theme.colors.greyLight,
              true: theme.colors.primary,
            }}
          />
        </View>
        {/* Recurring */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <MaterialCommunityIcons
            name="calendar-refresh"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
          <ThemeText
            style={{ flex: 1, fontSize: 16, color: theme.colors.text }}
          >
            Recurring
          </ThemeText>
          <Switch
            value={form.is_recurring}
            onValueChange={(v) => setForm((f) => ({ ...f, is_recurring: v }))}
            trackColor={{
              false: theme.colors.greyLight,
              true: theme.colors.primary,
            }}
          />
        </View>
        {/* Recurring Schedule */}
        {form.is_recurring && (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              padding: 12,
              backgroundColor: theme.colors.cardBackground,
              borderRadius: 10,
            }}
            onPress={() => setShowRecurringModal(true)}
          >
            <MaterialCommunityIcons
              name="repeat"
              size={20}
              color={theme.colors.primary}
              style={{ marginRight: 10 }}
            />
            <ThemeText
              style={{
                flex: 1,
                fontSize: 16,
                color: form.recurrence_rule
                  ? theme.colors.text
                  : theme.colors.grey,
              }}
            >
              {getRecurringDisplayText()}
            </ThemeText>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.grey}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Event Selection Modal */}
      <Modal visible={showEventModal} animationType="slide" transparent={true}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              maxHeight: "80%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <ThemeText style={{ fontSize: 20, fontWeight: "600" }}>
                Select Event
              </ThemeText>
              <TouchableOpacity onPress={() => setShowEventModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginBottom: 20 }}>
              {userEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.greyLight,
                  }}
                  onPress={() => handleEventSelect(event)}
                >
                  <View style={{ flex: 1 }}>
                    <ThemeText style={{ fontSize: 16, fontWeight: "500" }}>
                      {event.title}
                    </ThemeText>
                    <ThemeText
                      style={{
                        fontSize: 14,
                        color: theme.colors.grey,
                        marginTop: 4,
                      }}
                    >
                      {format(new Date(event.start_time), "MMM d, h:mm a")}
                    </ThemeText>
                    {event.location && (
                      <ThemeText
                        style={{
                          fontSize: 14,
                          color: theme.colors.grey,
                          marginTop: 2,
                        }}
                      >
                        {getLocationText(event.location)}
                      </ThemeText>
                    )}
                  </View>
                  {form.event_id === event.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Recurring Schedule Modal */}
      <Modal
        visible={showRecurringModal}
        animationType="slide"
        transparent={true}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              maxHeight: "80%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <ThemeText style={{ fontSize: 20, fontWeight: "600" }}>
                Recurring Schedule
              </ThemeText>
              <TouchableOpacity onPress={() => setShowRecurringModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Frequency Selection */}
            <ScrollView style={{ marginBottom: 20 }}>
              <ThemeText
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 10,
                }}
              >
                Frequency
              </ThemeText>
              {FREQUENCIES.map((frequency) => (
                <TouchableOpacity
                  key={frequency.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                  }}
                  onPress={() => handleFrequencyChange(frequency.id)}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: theme.colors.primary,
                      marginRight: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selectedFrequency === frequency.id && (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: theme.colors.primary,
                        }}
                      />
                    )}
                  </View>
                  <ThemeText style={{ fontSize: 16 }}>
                    {frequency.label}
                  </ThemeText>
                </TouchableOpacity>
              ))}

              <ThemeText
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  marginTop: 20,
                  marginBottom: 10,
                }}
              >
                Days of Week
              </ThemeText>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                  }}
                  onPress={() => handleDayToggle(day.id)}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: theme.colors.primary,
                      marginRight: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selectedDays.includes(day.id) && (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: theme.colors.primary,
                        }}
                      />
                    )}
                  </View>
                  <ThemeText style={{ fontSize: 16 }}>{day.label}</ThemeText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.primary,
                padding: 16,
                borderRadius: 10,
                alignItems: "center",
              }}
              onPress={handleSaveRecurring}
            >
              <ThemeText
                style={{ color: "white", fontSize: 16, fontWeight: "600" }}
              >
                Save Schedule
              </ThemeText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Footer */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 16,
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.grey,
        }}
      >
        <TouchableOpacity
          style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: theme.colors.grey,
          }}
          onPress={onBack}
        >
          <ThemeText style={{ color: theme.colors.text }}>Back</ThemeText>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: isValid ? theme.colors.primary : theme.colors.grey,
            opacity: isValid ? 1 : 0.5,
          }}
          onPress={onNext}
          disabled={!isValid}
        >
          <ThemeText style={{ color: "white" }}>Next</ThemeText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
