import CarList from "@/components/carpool/CarList";
import CarpoolList from "@/components/carpool/CarpoolList";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingIndicator from "@/components/LoadingIndicator";
import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { carService } from "@/services/carpool/carService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// Mock data for development
const MOCK_CARPOOLS = [
  {
    id: "1",
    driver_id: "user1",
    car_id: "car1",
    departure_location: "123 Main St, San Francisco",
    departure_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    destination_location: "456 Market St, San Francisco",
    destination_time: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    max_seats: 3,
    price: 15,
    cost: 10,
    description: "Going to the city center",
    is_private: false,
    is_recurring: false,
    status: "scheduled",
    driver: {
      id: "user1",
      username: "johndoe",
      first_name: "John",
      last_name: "Doe",
      image_url: "https://i.pravatar.cc/150?img=1",
    },
    car: {
      id: "car1",
      brand: "Toyota",
      model: "Camry",
      color: "Silver",
      seats: 5,
    },
  },
  {
    id: "2",
    driver_id: "user2",
    car_id: "car2",
    departure_location: "789 Oak St, San Francisco",
    departure_time: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    destination_location: "321 Pine St, San Francisco",
    destination_time: new Date(Date.now() + 10800000).toISOString(), // 3 hours from now
    max_seats: 2,
    price: 20,
    cost: 15,
    description: "Regular commute to work",
    is_private: false,
    is_recurring: true,
    recurrence_rule: "FREQ=WEEKLY;BYDAY=MO,WE,FR",
    status: "scheduled",
    driver: {
      id: "user2",
      username: "janedoe",
      first_name: "Jane",
      last_name: "Doe",
      image_url: "https://i.pravatar.cc/150?img=2",
    },
    car: {
      id: "car2",
      brand: "Honda",
      model: "Civic",
      color: "Blue",
      seats: 4,
    },
  },
];

export default function CarpoolScreen() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("available");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cars, setCars] = useState([]);

  const fetchCars = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const userCars = await carService.getCars(user.id);
      setCars(userCars);
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError("Failed to fetch cars");
    }
  };

  // Mock loading state
  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "myCars") {
        await fetchCars();
      } else {
        // Simulate API call for carpools
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (err) {
      setError("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "myCars") {
      fetchCars();
    }
  }, [activeTab]);

  const handleCarpoolPress = (carpool) => {
    router.push(`/carpools/${carpool.id}`);
  };

  const handleCarPress = (car) => {
    // TODO: Implement car details view
    console.log("Car pressed:", car);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (error) {
      return <ErrorMessage message={error} onRetry={handleRefresh} />;
    }

    switch (activeTab) {
      case "myCars":
        return <CarList cars={cars} onCarPress={handleCarPress} />;
      default:
        return (
          <CarpoolList
            carpools={MOCK_CARPOOLS}
            onCarpoolPress={handleCarpoolPress}
          />
        );
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[styles.tabs, { borderBottomColor: theme.colors.greyLight }]}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "available" && [
              styles.activeTab,
              { borderBottomColor: theme.colors.primary },
            ],
          ]}
          onPress={() => setActiveTab("available")}
        >
          <ThemeText
            color={
              activeTab === "available"
                ? theme.colors.primary
                : theme.colors.grey
            }
            style={[
              styles.tabText,
              activeTab === "available" && styles.activeTabText,
            ]}
          >
            Available
          </ThemeText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "my-carpools" && [
              styles.activeTab,
              { borderBottomColor: theme.colors.primary },
            ],
          ]}
          onPress={() => setActiveTab("my-carpools")}
        >
          <ThemeText
            color={
              activeTab === "my-carpools"
                ? theme.colors.primary
                : theme.colors.grey
            }
            style={[
              styles.tabText,
              activeTab === "my-carpools" && styles.activeTabText,
            ]}
          >
            My Carpools
          </ThemeText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "requests" && [
              styles.activeTab,
              { borderBottomColor: theme.colors.primary },
            ],
          ]}
          onPress={() => setActiveTab("requests")}
        >
          <ThemeText
            color={
              activeTab === "requests"
                ? theme.colors.primary
                : theme.colors.grey
            }
            style={[
              styles.tabText,
              activeTab === "requests" && styles.activeTabText,
            ]}
          >
            Requests
          </ThemeText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "myCars" && [
              styles.activeTab,
              { borderBottomColor: theme.colors.primary },
            ],
          ]}
          onPress={() => setActiveTab("myCars")}
        >
          <ThemeText
            color={
              activeTab === "myCars" ? theme.colors.primary : theme.colors.grey
            }
            style={[
              styles.tabText,
              activeTab === "myCars" && styles.activeTabText,
            ]}
          >
            My Cars
          </ThemeText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[1]} // Single item to render the content
        renderItem={() => renderContent()}
        keyExtractor={() => "content"}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
  },
  activeTabText: {
    fontWeight: "600",
  },
});
