import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const BottomSheetModal = forwardRef(
  (
    {
      snapPoints = ["50%"],
      title,
      onClose,
      onConfirm,
      confirmText = "Confirm",
      showConfirm = false,
      children,
      enablePanDownToClose = true,
      visible,
      ...props
    },
    ref
  ) => {
    const sheetRef = useRef(null);
    const theme = useTheme();

    // Memoize snap points to prevent unnecessary re-renders
    const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    useImperativeHandle(ref, () => ({
      open: () => {
        sheetRef.current?.expand();
        Haptics.selectionAsync();
      },
      close: () => {
        sheetRef.current?.close();
        Haptics.selectionAsync();
      },
      snapToIndex: (index) => {
        sheetRef.current?.snapToIndex(index);
      },
    }));

    const handleClose = useCallback(() => {
      sheetRef.current?.close();
      Haptics.selectionAsync();
      if (onClose) onClose();
    }, [onClose]);

    const handleConfirm = useCallback(() => {
      if (onConfirm) onConfirm();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, [onConfirm]);

    useEffect(() => {
      if (visible) {
        sheetRef.current?.expand();
      } else {
        sheetRef.current?.close();
      }
    }, [visible]);

    return (
      <BottomSheet
        ref={sheetRef}
        index={visible ? 0 : -1}
        snapPoints={memoizedSnapPoints}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          />
        )}
        onClose={handleClose}
        keyboardBehavior="interactive"
        handleIndicatorStyle={{
          backgroundColor: theme.colors.text,
        }}
        backgroundStyle={{
          backgroundColor: theme.colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        {...props}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.header}>
            <ThemeText style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </ThemeText>
          </View>
          {children}
          {showConfirm && (
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleConfirm}
            >
              <ThemeText style={{ color: "#fff", fontWeight: "bold" }}>
                {confirmText}
              </ThemeText>
            </TouchableOpacity>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  confirmButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});

export default BottomSheetModal;
