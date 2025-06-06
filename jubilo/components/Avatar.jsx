import { useTheme } from "@/hooks/theme";
import { useImageCache } from "@/hooks/useImageCache";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";

export default function Avatar({ uri, size = 40, style }) {
  const theme = useTheme();
  const { cachedUri } = useImageCache(uri);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.greyLight,
        },
        style,
      ]}
    >
      {cachedUri ? (
        <Image
          source={{ uri: cachedUri }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      ) : (
        <Ionicons
          name="person"
          size={size * 0.6}
          color={theme.colors.grey}
          style={styles.icon}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    resizeMode: "cover",
  },
  icon: {
    opacity: 0.5,
  },
});
