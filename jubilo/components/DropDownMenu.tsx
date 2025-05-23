import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
  GestureResponderEvent,
} from "react-native";
import { IconProps } from "@expo/vector-icons/build/createIconSet";
import ThemeText from "./ThemeText";
import { useTheme } from "../hooks/useTheme";

type MenuOption = {
  label: string;
  onPress?: () => void;
  icon?: React.ComponentType<IconProps<any>>;
  iconName?: string;
  key?: string;
};

type Props = {
  trigger: React.ComponentType<IconProps<any>> | string;
  triggerIconName?: string;
  options: MenuOption[];
};

const DropdownMenu: React.FC<Props> = ({
  trigger,
  triggerIconName = "menu",
  options,
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} style={styles.button}>
        {typeof trigger === "string" ? (
          <ThemeText>{trigger}</ThemeText>
        ) : (
          React.createElement(trigger, {
            size: 24,
            color: theme.colors.text,
            name: triggerIconName,
          })
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={[
            styles.overlay,
            { backgroundColor: theme.colors.background + "99" },
          ]}
          onPress={() => setOpen(false)}
        >
          <View
            style={[
              styles.menu,
              {
                backgroundColor: theme.colors.background,
                borderRadius: 10,
                borderWidth: 0.5,
                borderColor: theme.colors.grey,
              },
            ]}
          >
            {options.map((item, index) => (
              <React.Fragment key={item.key || index}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setOpen(false);
                    item.onPress?.();
                  }}
                >
                  {item.icon &&
                    React.createElement(item.icon, {
                      size: 18,
                      color: theme.colors.text,
                      name: item.iconName || "pencil",
                    })}
                  <ThemeText style={styles.menuText}>{item.label}</ThemeText>
                </TouchableOpacity>
                {index < options.length - 1 && (
                  <View
                    style={{
                      height: 0.6,
                      backgroundColor: theme.colors.grey,
                      marginHorizontal: 1,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 16,
  },
  menu: {
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 8,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  menuText: {
    fontSize: 16,
  },
});

export default DropdownMenu;
