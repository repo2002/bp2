import EmptyState from "@/components/EmptyState";
import { useTheme } from "@/hooks/theme";
import { FlatList, RefreshControl, View } from "react-native";
import EventCard from "./EventCard";

export default function EventList({
  events,
  onRefresh,
  refreshing,
  onEventPress,
}) {
  const theme = useTheme();
  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EventCard event={item} onPress={() => onEventPress(item)} />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <EmptyState
            message="No Events yet."
            style={{ flex: 1, backgroundColor: theme.colors.background }}
          />
        </View>
      }
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingBottom: 32,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
    />
  );
}
