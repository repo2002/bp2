import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { MessageBubble } from "./MessageBubble";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "./ThemeText";
import { Id } from "@/convex/_generated/dataModel";

interface TodoMessageProps {
  message: {
    _id: Id<"messages">;
    senderId: Id<"users">;
    message: string;
    messageType: string;
    messageTime: number;
    isEdited?: boolean;
    isDeleted?: boolean;
    isSeen?: boolean;
    isDelivered?: boolean;
    replyToId?: string;
    metadata?: {
      title: string;
      items: Array<{
        id: string;
        text: string;
        completed: boolean;
        completedBy?: Id<"users">;
        completedAt?: number;
      }>;
      completedCount: number;
      totalCount: number;
      dueDate?: number;
      assignees?: Id<"users">[];
    };
  };
  isOwnMessage: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
  currentUserId: Id<"users">;
}

export const TodoMessage = ({
  message,
  isOwnMessage,
  onLongPress,
  onPress,
  currentUserId,
}: TodoMessageProps) => {
  const theme = useTheme();
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  if (!message.metadata?.items) return null;

  const { title, items, completedCount, totalCount, dueDate, assignees } =
    message.metadata;

  const handleItemPress = (itemId: string) => {
    setCheckedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
    // TODO: Implement actual completion status update
  };

  return (
    <MessageBubble
      message={message}
      isOwnMessage={isOwnMessage}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemeText style={styles.title}>{title}</ThemeText>
          <ThemeText
            style={[
              styles.progress,
              {
                color: isOwnMessage ? theme.colors.primary : theme.colors.grey,
              },
            ]}
          >
            {completedCount}/{totalCount}
          </ThemeText>
        </View>
        <View style={styles.itemsContainer}>
          {items.map((item) => {
            const isChecked = item.completed || checkedItems.includes(item.id);
            const isCompletedByCurrentUser = item.completedBy === currentUserId;

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.itemContainer,
                  isChecked && {
                    backgroundColor: theme.colors.primary + "20",
                  },
                ]}
                onPress={() => handleItemPress(item.id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: isOwnMessage
                        ? theme.colors.primary
                        : theme.colors.grey,
                      backgroundColor: isChecked
                        ? isOwnMessage
                          ? theme.colors.primary
                          : theme.colors.grey
                        : "transparent",
                    },
                  ]}
                >
                  {isChecked && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={theme.colors.background}
                    />
                  )}
                </View>
                <View style={styles.itemContent}>
                  <ThemeText
                    style={[styles.itemText, isChecked && styles.completedText]}
                  >
                    {item.text}
                  </ThemeText>
                  {isCompletedByCurrentUser && (
                    <ThemeText
                      style={[
                        styles.completedBy,
                        {
                          color: isOwnMessage
                            ? theme.colors.primary
                            : theme.colors.grey,
                        },
                      ]}
                    >
                      You
                    </ThemeText>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
        {dueDate && (
          <View style={styles.footer}>
            <Ionicons
              name="time-outline"
              size={14}
              color={isOwnMessage ? theme.colors.primary : theme.colors.grey}
            />
            <ThemeText
              style={[
                styles.dueDate,
                {
                  color: isOwnMessage
                    ? theme.colors.primary
                    : theme.colors.grey,
                },
              ]}
            >
              Due {new Date(dueDate).toLocaleDateString()}
            </ThemeText>
          </View>
        )}
      </View>
    </MessageBubble>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  progress: {
    fontSize: 12,
  },
  itemsContainer: {
    gap: 8,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: {
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  completedBy: {
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  dueDate: {
    fontSize: 12,
  },
});
