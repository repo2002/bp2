import CarpoolList from "@/components/carpool/CarpoolList";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Stack, router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
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
  const [activeTab, setActiveTab] = useState("available");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock loading state
  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      setError("Failed to refresh carpools");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCarpool = () => {
    router.push("/carpool/create");
  };

  const handleCarpoolPress = (carpool) => {
    router.push(`/carpool/${carpool.id}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (error) {
      return <ErrorMessage message={error} onRetry={handleRefresh} />;
    }

    return (
      <CarpoolList
        carpools={MOCK_CARPOOLS}
        onCarpoolPress={handleCarpoolPress}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Carpools",
          headerRight: () => (
            <TouchableOpacity onPress={handleCreateCarpool}>
              <Text style={styles.createButton}>Create</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "available" && styles.activeTab]}
          onPress={() => setActiveTab("available")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "available" && styles.activeTabText,
            ]}
          >
            Available
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "my-carpools" && styles.activeTab]}
          onPress={() => setActiveTab("my-carpools")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "my-carpools" && styles.activeTabText,
            ]}
          >
            My Carpools
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "requests" && styles.activeTab]}
          onPress={() => setActiveTab("requests")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "requests" && styles.activeTabText,
            ]}
          >
            Requests
          </Text>
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
    backgroundColor: "#fff",
  },
  createButton: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
