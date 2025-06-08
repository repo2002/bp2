import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { carService } from "@/services/carpool/carService";
import { carpoolService } from "@/services/carpool/carpoolService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CarStep from "./steps/CarStep";
import OptionsStep from "./steps/OptionsStep";
import RouteStep from "./steps/RouteStep";
import SeatsStep from "./steps/SeatsStep";
import SummaryStep from "./steps/SummaryStep";

const CreateCarpoolScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [loadingCars, setLoadingCars] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    departure_location: null,
    departure_time: new Date(),
    destination_location: null,
    destination_time: new Date(),
    max_seats: 1,
    price: "",
    cost: "",
    description: "",
    is_private: false,
    is_recurring: false,
    recurrence_rule: "",
  });
  const [showDepartureTime, setShowDepartureTime] = useState(false);
  const [showDestinationTime, setShowDestinationTime] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { key: "car", component: CarStep },
    { key: "route", component: RouteStep },
    { key: "seats", component: SeatsStep },
    { key: "options", component: OptionsStep },
    { key: "summary", component: SummaryStep },
  ];
  const [stepIndex, setStepIndex] = useState(0);
  const StepComponent = steps[stepIndex].component;

  // Fetch user's cars
  useEffect(() => {
    (async () => {
      setLoadingCars(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const carsData = await carService.getCars(user.id);
          setCars(carsData);
          if (carsData.length > 0) setSelectedCar(carsData[0]);
        }
      } catch (e) {
        setError("Failed to load cars");
      } finally {
        setLoadingCars(false);
      }
    })();
  }, []);

  // Handlers
  const handleSelectCar = (car) => setSelectedCar(car);
  const handleAddCar = () => router.push("/carpools/add-car");
  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Validation
  const isValid =
    selectedCar &&
    form.departure_location &&
    form.destination_location &&
    form.departure_time &&
    form.max_seats > 0;

  // Submit
  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      await carpoolService.createCarpool({
        car_id: selectedCar.id,
        departure_location: form.departure_location,
        departure_time: form.departure_time,
        destination_location: form.destination_location,
        destination_time: form.destination_time,
        max_seats: form.max_seats,
        price: form.price ? Number(form.price) : null,
        cost: form.cost ? Number(form.cost) : null,
        description: form.description,
        is_private: form.is_private,
        is_recurring: form.is_recurring,
        recurrence_rule: form.is_recurring ? form.recurrence_rule : null,
      });
      router.back();
    } catch (e) {
      setError(e.message || "Failed to create carpool");
    } finally {
      setSubmitting(false);
    }
  };

  // Placeholder for location picker (replace with your own component)
  const LocationInput = ({ label, value, onChange }) => (
    <TouchableOpacity
      style={[styles.locationInput, { borderColor: theme.colors.grey }]}
      onPress={() => {
        // TODO: Open location picker modal
        onChange({ address: "Select on map", latitude: 0, longitude: 0 });
      }}
    >
      <ThemeText
        style={{ color: value ? theme.colors.text : theme.colors.grey }}
      >
        {value ? value.address : `Select ${label}`}
      </ThemeText>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
      }}
    >
      <View
        style={[
          styles.containerHeader,
          { borderBottomColor: theme.colors.grey },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerButton, { padding: 4 }]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemeText style={[styles.headerTitle, { color: theme.colors.text }]}>
          Create Carpool
        </ThemeText>
      </View>
      {stepIndex === 0 && (
        <CarStep
          cars={cars}
          selectedCar={selectedCar}
          setSelectedCar={setSelectedCar}
          loadingCars={loadingCars}
          onAddCar={handleAddCar}
          onNext={() => setStepIndex((i) => i + 1)}
        />
      )}
      {stepIndex === 1 && (
        <RouteStep
          form={form}
          setForm={setForm}
          onBack={() => setStepIndex((i) => i - 1)}
          onNext={() => setStepIndex((i) => i + 1)}
        />
      )}
      {stepIndex === 2 && (
        <SeatsStep
          form={form}
          setForm={setForm}
          onBack={() => setStepIndex((i) => i - 1)}
          onNext={() => setStepIndex((i) => i + 1)}
        />
      )}
      {stepIndex === 3 && (
        <OptionsStep
          form={form}
          setForm={setForm}
          onBack={() => setStepIndex((i) => i - 1)}
          onNext={() => setStepIndex((i) => i + 1)}
        />
      )}
      {stepIndex === 4 && (
        <SummaryStep
          form={form}
          selectedCar={selectedCar}
          onBack={() => setStepIndex((i) => i - 1)}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
        />
      )}
      {/* Step navigation buttons (Back/Next) can be added here for all steps */}
    </View>
  );
};

export default CreateCarpoolScreen;

const styles = StyleSheet.create({
  containerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.3,
  },
  headerButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  container: { flex: 1 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
  },
  carList: { flexDirection: "row", marginBottom: 16 },
  carCard: {
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
    alignItems: "center",
  },
  selectedCarCard: {
    borderWidth: 2,
  },
  addCarCard: {
    borderRadius: 10,
    padding: 12,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  addCarPlus: { fontSize: 16, fontWeight: "bold" },
  carTitle: { fontWeight: "bold", fontSize: 16 },
  carDetails: { fontSize: 14 },
  carSeats: { fontSize: 13 },
  noCarsContainer: { alignItems: "center", marginVertical: 32 },
  noCarsText: { fontSize: 16, marginBottom: 16 },
  addCarButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addCarButtonText: { fontWeight: "bold", fontSize: 16 },
  locationInput: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  timeInput: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  label: { flex: 1, fontSize: 16 },
  input: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginLeft: 8,
  },
  textArea: {
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 60,
    marginBottom: 12,
  },
  createButton: {
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  createButtonText: { fontWeight: "bold", fontSize: 18 },
  error: { color: "#fff", marginVertical: 8 },
});
