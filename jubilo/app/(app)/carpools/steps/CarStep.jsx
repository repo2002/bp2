import CarList from "@/components/carpool/CarList";
import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

export default function CarStep({
  cars,
  selectedCar,
  setSelectedCar,
  loadingCars,
  onAddCar,
  onNext,
}) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <ThemeText
          style={{
            fontSize: 18,
            fontWeight: "600",
            padding: 16,
          }}
        >
          Select Car
        </ThemeText>
        <ThemeText
          color={theme.colors.grey}
          style={{
            fontSize: 16,
            fontWeight: "600",

            padding: 16,
          }}
        >
          Step 1/4
        </ThemeText>
      </View>

      {loadingCars ? (
        <ActivityIndicator />
      ) : cars.length === 0 ? (
        <View style={{ alignItems: "center", marginVertical: 32 }}>
          <ThemeText style={{ fontSize: 16, marginBottom: 16 }}>
            You need to add a car before creating a carpool.
          </ThemeText>
          <TouchableOpacity
            style={{
              borderRadius: 8,
              backgroundColor: theme.colors.primary,
            }}
            onPress={onAddCar}
          >
            <ThemeText
              color="white"
              style={{ fontWeight: "bold", fontSize: 16 }}
            >
              Add a Car
            </ThemeText>
          </TouchableOpacity>
        </View>
      ) : (
        <CarList
          cars={cars}
          selectedCarId={selectedCar?.id}
          onSelectCar={setSelectedCar}
        />
      )}
      <TouchableOpacity
        style={{
          padding: 16,
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 10,
          alignItems: "center",
          backgroundColor: selectedCar
            ? theme.colors.primary
            : theme.colors.grey,
        }}
        onPress={selectedCar ? onNext : undefined}
        disabled={!selectedCar}
      >
        <ThemeText color="white" style={{ fontWeight: "bold", fontSize: 18 }}>
          Next
        </ThemeText>
      </TouchableOpacity>
    </View>
  );
}
