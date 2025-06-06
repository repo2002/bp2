import { useTheme } from "@/hooks/theme";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MasonryList from "react-native-masonry-list";

export default function EventGallery({ images }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const theme = useTheme();

  if (!images?.length) return null;

  const openModal = (idx) => {
    setSelectedIdx(idx);
    setModalVisible(true);
  };

  return (
    <>
      <MasonryList
        images={images.map((img) => ({ uri: img.image_url }))}
        imageContainerStyle={{
          borderRadius: 8,
          backgroundColor: theme.colors.background,
        }}
        spacing={1}
        style={{ backgroundColor: theme.colors.background, flex: 1 }}
        backgroundColor={theme.colors.background}
        columns={2}
        onPressImage={(item, index) => openModal(index)}
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
            <Image
              source={{ uri: images[selectedIdx]?.image_url }}
              style={[
                styles.fullImage,
                { backgroundColor: theme.colors.cardBackground },
              ]}
              resizeMode="contain"
            />
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
    // No padding or margin
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
    width: Dimensions.get("window").width - 32,
    height: Dimensions.get("window").height * 0.5,
    borderRadius: 12,
  },
});
