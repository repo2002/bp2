import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Switch, TextInput, TouchableOpacity, View } from "react-native";

export default function OptionsStep({ form, setForm, onBack, onNext }) {
  const theme = useTheme();
  // No required fields for this step, always allow Next
  const isValid = true;

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
            thumbColor={
              form.is_private ? theme.colors.primary : theme.colors.grey
            }
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
            name="calendar-repeat"
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
            thumbColor={
              form.is_recurring ? theme.colors.primary : theme.colors.grey
            }
          />
        </View>
        {/* Recurrence Rule */}
        {form.is_recurring && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <MaterialCommunityIcons
              name="repeat"
              size={20}
              color={theme.colors.primary}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={{
                flex: 1,
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor: theme.colors.cardBackground,
                color: theme.colors.text,
                fontSize: 16,
              }}
              value={form.recurrence_rule || ""}
              onChangeText={(v) =>
                setForm((f) => ({ ...f, recurrence_rule: v }))
              }
              placeholder="Recurrence Rule (e.g. FREQ=WEEKLY;BYDAY=MO,WE,FR)"
              placeholderTextColor={theme.colors.grey}
            />
          </View>
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
    </View>
  );
}
