import { useTheme } from "@/hooks/theme";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MasonryList from "react-native-masonry-list";

export default function EventGallery({ images = [] }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [error, setError] = useState(null);
  const theme = useTheme();

  if (!images?.length) return null;

  const openModal = (idx) => {
    if (idx >= 0 && idx < images.length) {
      setSelectedIdx(idx);
      setModalVisible(true);
      setImageDimensions({ width: 0, height: 0 });
      setError(null);
    }
  };

  // Calculate image dimensions when selected image changes
  useEffect(() => {
    if (modalVisible && images[selectedIdx]?.image_url) {
      Image.getSize(
        images[selectedIdx].image_url,
        (width, height) => {
          const screenWidth = Dimensions.get("window").width - 32;
          const scaleFactor = width / screenWidth;
          const scaledHeight = height / scaleFactor;

          setImageDimensions({
            width: screenWidth,
            height: scaledHeight,
          });
        },
        (error) => {
          console.error("Error loading image:", error);
          setError("Failed to load image");
          setModalVisible(false);
        }
      );
    }
  }, [modalVisible, selectedIdx, images]);

  // Filter out invalid images
  const validImages = images.filter((img) => img?.image_url);

  return (
    <>
      <MasonryList
        images={validImages.map((img) => ({
          uri: img.image_url,
          dimensions: { width: 300, height: 300 }, // Add default dimensions
          priority: "high",
        }))}
        imageContainerStyle={{
          borderRadius: 8,
          backgroundColor: theme.colors.background,
        }}
        spacing={1}
        style={{ backgroundColor: theme.colors.background, flex: 1 }}
        backgroundColor={theme.colors.background}
        columns={2}
        onPressImage={(item, index) => openModal(index)}
        customImageComponent={({ source, style }) => (
          <Image source={source} style={style} resizeMode="cover" />
        )}
      />
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalBg,
            { backgroundColor: theme.colors.modalOverlay },
          ]}
        >
          <TouchableOpacity
            style={styles.modalBg}
            onPress={() => setModalVisible(false)}
            activeOpacity={1}
          >
            {error ? (
              <View style={styles.errorContainer}>
                <ThemeText style={{ color: theme.colors.error }}>
                  {error}
                </ThemeText>
              </View>
            ) : (
              imageDimensions.width > 0 && (
                <Image
                  source={{
                    uri: images[selectedIdx]?.image_url,
                    cache: "force-cache", // Force cache for modal image
                  }}
                  style={[
                    styles.fullImage,
                    {
                      width: imageDimensions.width,
                      height: imageDimensions.height,
                      backgroundColor: theme.colors.cardBackground,
                    },
                  ]}
                  resizeMode="contain"
                  onError={(e) => {
                    console.error(
                      "Error displaying image:",
                      e.nativeEvent.error
                    );
                    setError("Failed to display image");
                  }}
                />
              )
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  galleryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  thumb: {
    width: 100,
    height: 100,
    margin: 0,
    padding: 0,
  },
  modalBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    borderRadius: 12,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
  },
  errorText: {
    textAlign: "center",
  },
});
