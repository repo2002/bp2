import { timeAgo } from "@/helpers/common";
import { useTheme } from "@/hooks/theme";
import {
  acceptFollowRequest,
  denyFollowRequest,
  getPendingFollowRequests,
} from "@/services/followService";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Avatar from "./Avatar";

const FollowRequests = ({ onRequestHandled }) => {
  const theme = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadRequests = useCallback(async () => {
    try {
      setError(null);
      const { data, error } = await getPendingFollowRequests();
      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleAccept = async (requestId) => {
    try {
      const { error } = await acceptFollowRequest(requestId);
      if (error) throw error;

      setRequests(requests.filter((r) => r.id !== requestId));
      onRequestHandled?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeny = async (requestId) => {
    try {
      const { error } = await denyFollowRequest(requestId);
      if (error) throw error;

      setRequests(requests.filter((r) => r.id !== requestId));
      onRequestHandled?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderRequest = ({ item }) => {
    const follower = item.follower;

    return (
      <View style={styles.requestContainer}>
        <View style={styles.userInfo}>
          <Avatar uri={follower.avatar_url} size={40} />
          <View style={styles.textContainer}>
            <Text style={[styles.username, { color: theme.colors.text }]}>
              {follower.username}
            </Text>
            <Text style={[styles.time, { color: theme.colors.greyDark }]}>
              {timeAgo(item.created_at)}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={() => handleAccept(item.id)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.denyButton]}
            onPress={() => handleDeny(item.id)}
          >
            <Text style={[styles.buttonText, { color: theme.colors.error }]}>
              Deny
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={loadRequests}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.greyDark }]}>
          No pending follow requests
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      renderItem={renderRequest}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.list}
    />
  );
};

export default FollowRequests;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  list: {
    padding: 16,
  },
  requestContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  denyButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#f44336",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
