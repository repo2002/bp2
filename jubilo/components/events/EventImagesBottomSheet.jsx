import BottomSheetModal from "@/components/BottomSheetModal";
import ThemeText from "@/components/theme/ThemeText";
import { useRef } from "react";
import { StyleSheet, View } from "react-native";

export default function EventImagesBottomSheet({
  eventId,
  visible,
  onClose,
  images = [],
  canUpload = false,
}) {
  const sheetRef = useRef(null);
  const snapPoints = ["80%", "95%"];

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      title="Event Images"
      visible={visible}
      onClose={onClose}
    >
      <View style={styles.sheetContent}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ThemeText
            style={{ textAlign: "center", marginTop: 16, color: "#888" }}
          >
            Images grid coming soon
          </ThemeText>
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    padding: 0,
    gap: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 8,
    zIndex: 10,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 16,
  },
});
