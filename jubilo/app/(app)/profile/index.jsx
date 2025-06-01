import ProfileTabs from "@/components/ProfileTabs";
import ThemeText from "@/components/theme/ThemeText";
import UserHeader from "@/components/UserHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DropdownMenu from "../../../components/DropdownMenu";

const Profile = () => {
  const insets = useSafeAreaInsets();
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [newPostMenuVisible, setNewPostMenuVisible] = useState(false);
  const [newPostMenuPosition, setNewPostMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogout = () => {
    Alert.alert("Confirm", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel", style: "cancel" },
      { text: "Logout", onPress: onLogout, style: "destructive" },
    ]);
  };

  const handleMenuPress = (event) => {
    const { locationX, locationY } = event.nativeEvent;

    event.target.measure((x, y, width, height, pageX, pageY) => {
      setMenuPosition({
        x: pageX - 170,
        y: pageY + height,
      });
      setMenuVisible(true);
    });
  };

  const handleNewPostPress = (event) => {
    const { locationX, locationY } = event.nativeEvent;

    event.target.measure((x, y, width, height, pageX, pageY) => {
      setNewPostMenuPosition({
        x: pageX - 170,
        y: pageY + height + 10,
      });
      setNewPostMenuVisible(true);
    });
  };

  const menuOptions = [
    {
      label: "Edit Profile",
      onPress: () => {
        router.push("/profile/edit");
      },
    },
    {
      label: "Settings",
      onPress: () => {
        router.push("/settings");
      },
    },
    {
      label: "Logout",
      onPress: handleLogout,
      destructive: true,
    },
  ];
  const newPostOptions = [
    {
      label: "Create a post",
      onPress: () => {
        router.push("/post");
      },
      icon: "plus-box-outline",
    },
    {
      label: "Create a carpool",
      onPress: () => {
        router.push("/carpools");
      },
      icon: "car",
    },
    {
      label: "List new item",
      onPress: () => {
        router.push("/marketplace");
      },
      icon: "shopping-outline",
    },
    {
      label: "Create an event",
      onPress: () => {
        router.push("/events");
      },
      icon: "calendar-outline",
    },
  ];

  return (
    <View style={{ paddingTop: insets.top, flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
          borderBottomWidth: 0.2,
          borderBottomColor: theme.colors.greyDark,
          paddingBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemeText style={[styles.title, { fontSize: 20, fontWeight: "bold" }]}>
          {user?.username}
        </ThemeText>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleNewPostPress}>
            <MaterialCommunityIcons
              name="plus-box-outline"
              size={24}
              color={theme.colors.text}
            />
            <DropdownMenu
              visible={newPostMenuVisible}
              onClose={() => setNewPostMenuVisible(false)}
              options={newPostOptions}
              anchorPosition={newPostMenuPosition}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMenuPress}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color={theme.colors.text}
            />
            <DropdownMenu
              visible={menuVisible}
              onClose={() => setMenuVisible(false)}
              options={menuOptions}
              anchorPosition={menuPosition}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <UserHeader user={user} router={router} />
      </View>
      <ProfileTabs userId={user?.id} />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
  },
  logoutButton: {
    padding: 16,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
