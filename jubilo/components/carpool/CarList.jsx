import { FlatList, StyleSheet, Text, View } from "react-native";
import { EmptyState } from "../EmptyState";

export const CarList = ({ cars, onCarPress }) => {
  if (!cars?.length) {
    return (
      <EmptyState
        title="No Cars Added"
        description="Add your car to start creating carpools"
      />
    );
  }

  return (
    <FlatList
      data={cars}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.carItem}>
          <Text style={styles.carName}>
            {item.brand} {item.model}
          </Text>
          <Text style={styles.carDetails}>
            {item.color} • {item.seats} seats
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  carItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  carName: {
    fontSize: 16,
    fontWeight: "600",
  },
  carDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
