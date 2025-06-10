import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useBottomSheet } from "@/contexts/BottomSheetContext";
import { getShortContent } from "@/helpers/common";
import { useTheme } from "@/hooks/theme";
import { getSupabaseFileUrl } from "@/services/postService";
import { getUsers } from "@/services/userService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { forwardRef, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheetModal from "./BottomSheetModal";
import EmptyState from "./EmptyState";
import ErrorMessage from "./ErrorMessage";
import LoadingIndicator from "./LoadingIndicator";
import UserChip from "./UserChip";

const ShareBottomSheet = forwardRef((_, ref) => {
  const theme = useTheme();
  const snapPoints = useMemo(() => ["50%", "75"], []);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const { user } = useAuth();
  const { selectedPost, shareSheetRef } = useBottomSheet();
  const authUserId = user?.id;
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    setErrorMsg(null);
    getUsers().then((res) => {
      if (res.error) setErrorMsg(res.error.message || "Failed to load users.");
      setUsers(res.data || []);
    });
  }, []);

  // Filter users based on search and exclude the authenticated user
  const filteredUsers = users.filter(
    (u) =>
      u.id !== authUserId &&
      (`${u?.first_name} ${u?.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleInAppShare = (userId) => {
    console.log("In-app share with user:", userId);
    // Add your in-app share logic here
    shareSheetRef.current?.close();
  };

  const handleExternalShare = async () => {
    if (!selectedPost || shareLoading) return;
    setShareLoading(true);
    setErrorMsg(null);
    try {
      const content = {
        message: getShortContent(selectedPost.content),
      };
      if (selectedPost.images && selectedPost.images.length > 0) {
        content.url = getSupabaseFileUrl(
          `post-media/${selectedPost.images[0]}`
        );
      }
      await Share.share(content);
    } catch (error) {
      setErrorMsg(error.message || "Failed to share externally.");
      console.error("Error sharing:", error);
    } finally {
      setShareLoading(false);
      shareSheetRef.current?.close();
    }
  };

  return (
    <BottomSheetModal
      ref={shareSheetRef}
      snapPoints={snapPoints}
      keyboardBehavior="extend"
      title={
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingVertical: 0,
          }}
        >
          <ThemeText
            style={[styles.optionText, { fontSize: 24, fontWeight: "bold" }]}
          >
            Share
          </ThemeText>
          <TouchableOpacity
            onPress={handleExternalShare}
            disabled={shareLoading}
          >
            <Ionicons
              name="share-outline"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.sheetContent}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: theme.colors.cardBackground,
            borderRadius: 8,
            padding: 10,
            marginBottom: 12,
          }}
        >
          <BottomSheetTextInput
            placeholder="Search users..."
            value={search}
            onChangeText={setSearch}
            style={{
              color: theme.colors.text,
              flex: 1,
            }}
            placeholderTextColor={theme.colors.grey}
          />
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={theme.colors.text}
          />
        </View>
        <ErrorMessage error={errorMsg} />
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{}}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleInAppShare(item.id)}
              style={{
                gap: 4,
                padding: 10,
                borderRadius: 12,
              }}
            >
              <UserChip
                user={item}
                size={60}
                subtitle={item?.first_name + " " + item?.last_name}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            shareLoading ? (
              <LoadingIndicator text="Loading users..." />
            ) : (
              <EmptyState message="No users found." />
            )
          }
        />
      </View>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetContent: {
    paddingTop: 0,
    justifyContent: "space-between",
    flex: 1,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ShareBottomSheet;
