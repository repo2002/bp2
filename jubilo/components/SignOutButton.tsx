import { useClerk } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import ThemeText from "./ThemeText";

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to your desired page
      router.replace("/login");
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };
  return (
    <TouchableOpacity onPress={handleSignOut}>
      <ThemeText>Sign out</ThemeText>
    </TouchableOpacity>
  );
};
