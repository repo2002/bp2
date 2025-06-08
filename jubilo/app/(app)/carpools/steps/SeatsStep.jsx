import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity, View } from "react-native";

export default function SeatsStep({ form, setForm, onBack, onNext }) {
  const theme = useTheme();
  const isValid = form.max_seats > 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <ThemeText style={{ fontSize: 18, fontWeight: "600", padding: 16 }}>
          Seats & Pricing
        </ThemeText>
        <ThemeText
          color={theme.colors.grey}
          style={{ fontSize: 16, fontWeight: "600", padding: 16 }}
        >
          Step 3/4
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
        {/* Max Seats */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Ionicons
            name="people-outline"
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
            keyboardType="number-pad"
            value={form.max_seats?.toString() || ""}
            onChangeText={(v) =>
              setForm((f) => ({
                ...f,
                max_seats: Math.max(1, parseInt(v) || 1),
              }))
            }
            placeholder="Max Seats"
            placeholderTextColor={theme.colors.grey}
          />
        </View>
        {/* Price */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <MaterialCommunityIcons
            name="currency-usd"
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
            keyboardType="decimal-pad"
            value={form.price?.toString() || ""}
            onChangeText={(v) => setForm((f) => ({ ...f, price: v }))}
            placeholder="Price (optional)"
            placeholderTextColor={theme.colors.grey}
          />
        </View>
        {/* Cost */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <MaterialCommunityIcons
            name="cash-multiple"
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
            keyboardType="decimal-pad"
            value={form.cost?.toString() || ""}
            onChangeText={(v) => setForm((f) => ({ ...f, cost: v }))}
            placeholder="Cost (optional)"
            placeholderTextColor={theme.colors.grey}
          />
        </View>
        {/* Description */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <Ionicons
            name="document-text-outline"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 10, marginTop: 8 }}
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
              minHeight: 60,
            }}
            value={form.description || ""}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="Add a description (optional)"
            placeholderTextColor={theme.colors.grey}
            multiline
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
