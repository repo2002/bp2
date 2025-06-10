import ThemeText from "@/components/theme/ThemeText";
import { useState } from "react";
import {
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChecklistModal({ visible, onClose, onSend, theme }) {
  const [title, setTitle] = useState("");
  const [items, setItems] = useState([""]);
  const addItem = () => setItems([...items, ""]);
  const updateItem = (text, idx) => {
    const newItems = [...items];
    newItems[idx] = text;
    setItems(newItems);
  };
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.cardBackground,
            padding: 20,
            borderRadius: 16,
            width: "100%",
          }}
        >
          <ThemeText
            color={theme.colors.text}
            style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
          >
            New Checklist
          </ThemeText>
          <TextInput
            placeholder="Checklist Title"
            value={title}
            onChangeText={setTitle}
            style={{
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              borderColor: theme.colors.greyLight,
              borderWidth: 1,
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
            }}
            placeholderTextColor={theme.colors.grey}
          />
          <FlatList
            data={items}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <TextInput
                  placeholder={`Item ${index + 1}`}
                  value={item}
                  onChangeText={(text) => updateItem(text, index)}
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.greyLight,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 10,
                  }}
                  placeholderTextColor={theme.colors.grey}
                />
                <TouchableOpacity
                  onPress={() => removeItem(index)}
                  style={{ marginLeft: 8 }}
                >
                  <ThemeText
                    color={theme.colors.error}
                    style={{ fontWeight: "bold" }}
                  >
                    ✕
                  </ThemeText>
                </TouchableOpacity>
              </View>
            )}
            ListFooterComponent={
              <TouchableOpacity onPress={addItem} style={{ marginTop: 8 }}>
                <ThemeText
                  color={theme.colors.primary}
                  style={{ fontWeight: "bold" }}
                >
                  + Add Item
                </ThemeText>
              </TouchableOpacity>
            }
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: 16,
            }}
          >
            <TouchableOpacity onPress={onClose} style={{ marginRight: 16 }}>
              <ThemeText color={theme.colors.grey}>Cancel</ThemeText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onSend(
                  title,
                  items.filter((i) => i.trim() !== "")
                );
                setTitle("");
                setItems([""]);
              }}
              disabled={!title.trim() || items.every((i) => !i.trim())}
            >
              <ThemeText
                color={theme.colors.primary}
                style={{ fontWeight: "bold" }}
              >
                Send
              </ThemeText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
