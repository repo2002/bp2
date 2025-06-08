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
    departure_location: {
      address: "Tel Aviv, Israel",
      latitude: 32.0853,
      longitude: 34.7818,
    },
    departure_time: "2024-06-08T18:05:00Z",
    destination_location: {
      address: "Jerusalem, Israel",
      latitude: 31.7683,
      longitude: 35.2137,
    },
    destination_time: "2024-06-08T19:05:00Z",
    max_seats: 3,
    price: 15,
    cost: 10,
    description: "Regular commute to work",
    is_private: false,
    is_recurring: true,
    recurrence_rule: "FREQ=WEEKLY;BYDAY=MO,WE,FR",
    status: "scheduled",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    driver: {
      id: "user1",
      username: "johndoe",
      first_name: "John",
      last_name: "Doe",
      image_url: "https://i.pravatar.cc/150?img=1",
    },
    car: {
      id: "car1",
      make: "Toyota",
      model: "Camry",
      color: "Silver",
      seats: 5,
    },
    passengers: [
      {
        id: "pass1",
        user_id: "user2",
        status: "confirmed",
        user: {
          id: "user2",
          username: "janedoe",
          first_name: "Jane",
          last_name: "Doe",
          image_url: "https://i.pravatar.cc/150?img=2",
        },
      },
    ],
  },
  {
    id: "2",
    driver_id: "user3",
    car_id: "car2",
    departure_location: {
      address: "Haifa, Israel",
      latitude: 32.794,
      longitude: 34.9896,
    },
    departure_time: "2024-06-08T19:05:00Z",
    destination_location: {
      address: "Netanya, Israel",
      latitude: 32.3215,
      longitude: 34.8532,
    },
    destination_time: "2024-06-08T20:05:00Z",
    max_seats: 2,
    price: 20,
    cost: 15,
    description: "Evening ride to the beach",
    is_private: false,
    is_recurring: false,
    recurrence_rule: null,
    status: "scheduled",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    driver: {
      id: "user3",
      username: "bobsmith",
      first_name: "Bob",
      last_name: "Smith",
      image_url: "https://i.pravatar.cc/150?img=3",
    },
    car: {
      id: "car2",
      make: "Honda",
      model: "Civic",
      color: "Blue",
      seats: 4,
    },
    passengers: [
      {
        id: "pass2",
        user_id: "user4",
        status: "pending",
        user: {
          id: "user4",
          username: "alicej",
          first_name: "Alice",
          last_name: "Johnson",
          image_url: "https://i.pravatar.cc/150?img=4",
        },
      },
    ],
  },
  {
    id: "3",
    driver_id: "user5",
    car_id: "car3",
    departure_location: "555 Beach Rd, San Francisco",
    departure_time: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
    destination_location: "888 Mountain View, San Francisco",
    destination_time: new Date(Date.now() + 93600000).toISOString(), // 26 hours from now
    max_seats: 4,
    price: 25,
    cost: 20,
    description: "Weekend trip to the mountains",
    is_private: false,
    is_recurring: false,
    recurrence_rule: null,
    status: "scheduled",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    driver: {
      id: "user5",
      username: "mikeb",
      first_name: "Mike",
      last_name: "Brown",
      image_url: "https://i.pravatar.cc/150?img=5",
    },
    car: {
      id: "car3",
      make: "Tesla",
      model: "Model 3",
      color: "Red",
      seats: 5,
    },
    passengers: [
      {
        id: "pass3",
        user_id: "user6",
        status: "confirmed",
        user: {
          id: "user6",
          username: "sarahw",
          first_name: "Sarah",
          last_name: "Wilson",
          image_url: "https://i.pravatar.cc/150?img=6",
        },
      },
      {
        id: "pass4",
        user_id: "user7",
        status: "cancelled",
        user: {
          id: "user7",
          username: "tomh",
          first_name: "Tom",
          last_name: "Harris",
          image_url: "https://i.pravatar.cc/150?img=7",
        },
      },
    ],
  },
  {
    id: "4",
    driver_id: "user8",
    car_id: "car4",
    departure_location: "222 Tech Park, San Francisco",
    departure_time: new Date(Date.now() + 43200000).toISOString(), // 12 hours from now
    destination_location: "333 Business Center, San Francisco",
    destination_time: new Date(Date.now() + 46800000).toISOString(), // 13 hours from now
    max_seats: 3,
    price: 18,
    cost: 12,
    description: "Daily commute to tech park",
    is_private: false,
    is_recurring: true,
    recurrence_rule: "FREQ=DAILY",
    status: "in_progress",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    driver: {
      id: "user8",
      username: "davidl",
      first_name: "David",
      last_name: "Lee",
      image_url: "https://i.pravatar.cc/150?img=8",
    },
    car: {
      id: "car4",
      make: "BMW",
      model: "X5",
      color: "Black",
      seats: 5,
    },
    passengers: [
      {
        id: "pass5",
        user_id: "user9",
        status: "confirmed",
        user: {
          id: "user9",
          username: "emilyc",
          first_name: "Emily",
          last_name: "Chen",
          image_url: "https://i.pravatar.cc/150?img=9",
        },
      },
      {
        id: "pass6",
        user_id: "user10",
        status: "confirmed",
        user: {
          id: "user10",
          username: "jamesk",
          first_name: "James",
          last_name: "Kim",
          image_url: "https://i.pravatar.cc/150?img=10",
        },
      },
    ],
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
