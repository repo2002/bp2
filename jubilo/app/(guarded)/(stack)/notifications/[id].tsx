import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Notification() {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Notification {id}</Text>
    </View>
  );
}
