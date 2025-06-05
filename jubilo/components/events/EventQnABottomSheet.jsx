import BottomSheetModal from "@/components/BottomSheetModal";
import EventQnA from "@/components/events/EventQnA";
import { useRef } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

export default function EventQnABottomSheet({
  eventId,
  visible,
  onClose,
  canAsk,
  onQuestionAdded,
}) {
  const sheetRef = useRef(null);
  const snapPoints = ["80%"];

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      title="Event Q&A"
      visible={visible}
      onClose={onClose}
    >
      <View style={styles.sheetContent}>
        <View style={styles.headerRow}></View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <EventQnA
            eventId={eventId}
            canAsk={canAsk}
            onQuestionAdded={onQuestionAdded}
          />
        </KeyboardAvoidingView>
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
});
