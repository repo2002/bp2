import BottomSheetModal from "@/components/BottomSheetModal";
import EventQnA from "@/components/events/EventQnA";
import { useMemo, useRef } from "react";
import { StyleSheet } from "react-native";

export default function EventQnABottomSheet({
  eventId,
  visible,
  onClose,
  canAsk,
  canAnswer = false,
  onQuestionAdded,
}) {
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["60%", "90%"], []);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      title="Event Q&A"
      visible={visible}
      onClose={onClose}
      style={styles.sheetContent}
    >
      <EventQnA
        eventId={eventId}
        canAsk={canAsk}
        canAnswer={canAnswer}
        onQuestionAdded={onQuestionAdded}
      />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    padding: 0,
  },
});
