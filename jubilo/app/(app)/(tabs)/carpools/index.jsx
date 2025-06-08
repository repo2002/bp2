import CarList from "@/components/carpool/CarList";
import CarpoolList from "@/components/carpool/CarpoolList";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingIndicator from "@/components/LoadingIndicator";
import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { carpoolService } from "@/services/carpool/carpoolService";
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

export default function CarpoolScreen() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("available");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cars, setCars] = useState([]);
  const [carpools, setCarpools] = useState([]);

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

  const fetchCarpools = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await carpoolService.getCarpools();
      setCarpools(data);
    } catch (err) {
      setError("Failed to fetch carpools");
    } finally {
      setIsLoading(false);
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
        await fetchCarpools();
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
    } else {
      fetchCarpools();
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
            carpools={carpools}
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
          isLoading && activeTab !== "myCars" ? (
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          ) : null
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
