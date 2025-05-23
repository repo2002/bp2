import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { MessageBubble } from "./MessageBubble";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "./ThemeText";
import { Id } from "@/convex/_generated/dataModel";

interface PollMessageProps {
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
      question: string;
      options: Array<{
        id: string;
        text: string;
        votes: number;
        voters: Id<"users">[];
      }>;
      totalVotes: number;
      endTime?: number;
      isMultipleChoice?: boolean;
      isAnonymous?: boolean;
    };
  };
  isOwnMessage: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
  currentUserId: Id<"users">;
}

export const PollMessage = ({
  message,
  isOwnMessage,
  onLongPress,
  onPress,
  currentUserId,
}: PollMessageProps) => {
  const theme = useTheme();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  if (!message.metadata?.options) return null;

  const {
    question,
    options,
    totalVotes,
    endTime,
    isMultipleChoice,
    isAnonymous,
  } = message.metadata;

  const hasVoted = options.some((option) =>
    option.voters.includes(currentUserId)
  );

  const handleOptionPress = (optionId: string) => {
    if (hasVoted) return;

    if (isMultipleChoice) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const getVotePercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <MessageBubble
      message={message}
      isOwnMessage={isOwnMessage}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <View style={styles.container}>
        <ThemeText style={styles.question}>{question}</ThemeText>
        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const percentage = getVotePercentage(option.votes);
            const hasVotedForOption = option.voters.includes(currentUserId);

            return (
              <Pressable
                key={option.id}
                style={[
                  styles.optionContainer,
                  hasVotedForOption && {
                    backgroundColor: theme.colors.primary + "20",
                  },
                ]}
                onPress={() => handleOptionPress(option.id)}
                disabled={hasVoted}
              >
                <View style={styles.optionContent}>
                  <ThemeText style={styles.optionText}>{option.text}</ThemeText>
                  {hasVoted && (
                    <ThemeText
                      style={[
                        styles.voteCount,
                        {
                          color: isOwnMessage
                            ? theme.colors.primary
                            : theme.colors.grey,
                        },
                      ]}
                    >
                      {percentage}%
                    </ThemeText>
                  )}
                </View>
                {hasVoted && (
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${percentage}%`,
                        backgroundColor: isOwnMessage
                          ? theme.colors.primary
                          : theme.colors.grey,
                      },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
        <View style={styles.footer}>
          <ThemeText
            style={[
              styles.voteCount,
              {
                color: isOwnMessage ? theme.colors.primary : theme.colors.grey,
              },
            ]}
          >
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          </ThemeText>
          {endTime && (
            <ThemeText
              style={[
                styles.endTime,
                {
                  color: isOwnMessage
                    ? theme.colors.primary
                    : theme.colors.grey,
                },
              ]}
            >
              Ends {new Date(endTime).toLocaleDateString()}
            </ThemeText>
          )}
        </View>
      </View>
    </MessageBubble>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
  },
  question: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  optionText: {
    flex: 1,
    marginRight: 8,
  },
  voteCount: {
    fontSize: 12,
  },
  progressBar: {
    height: 2,
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  endTime: {
    fontSize: 12,
  },
});
