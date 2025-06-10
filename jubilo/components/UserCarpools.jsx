import CarpoolList from "@/components/carpool/CarpoolList";
import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { carpoolService } from "@/services/carpool/carpoolService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import EmptyState from "./EmptyState";
import LoadingIndicator from "./LoadingIndicator";

export default function UserCarpools({ userId }) {
  const theme = useTheme();
  const router = useRouter();
  const [carpools, setCarpools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // If viewing own profile, use getMyCarpools
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const data =
        user?.id === userId
          ? await carpoolService.getMyCarpools()
          : await carpoolService.getCarpools({ driver_id: userId });
      setCarpools(data || []);
    } catch (error) {
      console.error("Error fetching carpools:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleCarpoolPress = (carpool) => {
    router.push(`/carpools/${carpool.id}`);
  };

  if (loading) return <LoadingIndicator text="Loading carpools..." />;
  if (!carpools.length) return <EmptyState message="No carpools yet." />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <CarpoolList carpools={carpools} onCarpoolPress={handleCarpoolPress} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
