import { useTheme } from "@/hooks/theme";
import { acceptFollowRequest } from "@/services/followService";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AcceptButton = ({ requestId, onAccept, style }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await acceptFollowRequest(requestId);
      if (error) throw error;
      if (onAccept) onAccept();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.success }]}
        onPress={handleAccept}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="checkmark-outline" size={18} color="white" />
            <Text style={[styles.text, { color: "white" }]}>Accept</Text>
          </>
        )}
      </TouchableOpacity>
      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default AcceptButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    fontSize: 12,
    marginLeft: 8,
  },
});
