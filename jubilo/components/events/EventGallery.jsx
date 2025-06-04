import { useTheme } from "@/hooks/theme";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[
          styles.scrollView,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {images.map((img, idx) => (
          <TouchableOpacity key={img.id || idx} onPress={() => openModal(idx)}>
            <Image
              source={{ uri: img.image_url }}
              style={[styles.thumb, { backgroundColor: theme.colors.border }]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  scrollView: {
    marginVertical: 8,
    paddingLeft: 16,
  },
  thumb: {
    width: 100,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
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
