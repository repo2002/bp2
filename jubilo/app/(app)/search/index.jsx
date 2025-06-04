import EmptyState from "@/components/EmptyState";
import FollowButton from "@/components/FollowButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import ThemeText from "@/components/theme/ThemeText";
import UserChip from "@/components/UserChip";
import { useAuth } from "@/contexts/AuthContext";
import { getShortContent } from "@/helpers/common";
import { useTheme } from "@/hooks/theme";
import { getUsers } from "@/services/userService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function PageHeader({ search, setSearch }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <TouchableOpacity onPress={router.back}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={40}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <ThemeText style={styles.bigTitle}>Search</ThemeText>
      </View>
      <View
        style={[
          styles.searchBar,
          { backgroundColor: theme.colors.cardBackground },
        ]}
      >
        <TextInput
          placeholder="Search users..."
          value={search}
          onChangeText={setSearch}
          style={{
            color: theme.colors.text,
            flex: 1,
            fontSize: 16,
            padding: 8,
          }}
          placeholderTextColor={theme.colors.grey}
        />
        <MaterialCommunityIcons
          name="magnify"
          size={24}
          color={theme.colors.text}
        />
      </View>
    </View>
  );
}

export default function SearchPage() {
  const theme = useTheme();
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    setErrorMsg(null);
    getUsers().then((res) => {
      if (res.error) setErrorMsg(res.error.message || "Failed to load users.");
      const filteredData = (res.data || []).filter(
        (user) => user.id !== authUser.id
      );
      setUsers(filteredData);
      setLoading(false);
    });
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      `${u?.first_name} ${u?.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PageHeader search={search} setSearch={setSearch} />
      {loading ? (
        <LoadingIndicator text="Loading users..." />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <UserChip
                user={item}
                size={60}
                subtitle={
                  <View>
                    {item.is_private ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="lock"
                          size={12}
                          color={theme.colors.error}
                        />
                        <ThemeText>
                          {item.first_name} {item.last_name}
                        </ThemeText>
                      </View>
                    ) : (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="lock-open"
                          size={12}
                          color={theme.colors.success}
                        />
                        <ThemeText>
                          {getShortContent(
                            `${item.first_name} ${item.last_name}`,
                            20
                          )}
                        </ThemeText>
                      </View>
                    )}
                  </View>
                }
              />
              <View style={{ width: "30%" }}>
                <FollowButton userId={item.id} />
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              message={
                search ? "No users found." : "Start typing to search users."
              }
            />
          }
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "transparent",
  },
  bigTitle: {
    fontSize: 36,
    fontWeight: "bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 4,
  },
});
