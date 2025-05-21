import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Chat() {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Chat {id}</Text>
    </View>
  );
}
