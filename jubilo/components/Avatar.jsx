import { getUserImageSource } from "@/services/imageService";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

const Avatar = ({ uri, size = 40, borderRadius = 100, style = {} }) => {
  const [imageSource, setImageSource] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      const source = await getUserImageSource(uri);
      setImageSource(source);
    };

    loadImage();
  }, [uri]);

  if (!imageSource) {
    return null;
  }

  return (
    <Image
      source={imageSource}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius },
        style,
      ]}
    />
  );
};

export default Avatar;

const styles = StyleSheet.create({});
