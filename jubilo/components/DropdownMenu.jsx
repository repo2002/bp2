import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../hooks/theme";
import ThemeText from "./theme/ThemeText";

export default function DropdownMenu({
  visible,
  onClose,
  options,
  icon,
  anchorPosition = { x: 0, y: 0 },
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handleOptionPress = (option) => {
    option.onPress();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View
            style={[
              styles.menuContainer,
              {
                backgroundColor: theme.colors.cardBackground,
                top: anchorPosition.y,
                left: anchorPosition.x,
              },
            ]}
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  index !== options.length - 1 && styles.optionBorder,
                  { borderBottomColor: theme.colors.greyLight },
                ]}
                onPress={() => handleOptionPress(option)}
              >
                {option.icon && (
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={24}
                    color={theme.colors.text}
                    style={{ marginRight: 8 }}
                  />
                )}
                <ThemeText
                  style={[
                    styles.optionText,
                    option.destructive && { color: theme.colors.error },
                  ]}
                >
                  {option.label}
                </ThemeText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContainer: {
    position: "absolute",
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionBorder: {
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
});
