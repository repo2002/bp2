import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { getShortContent } from "@/helpers/common";
import { useChecklistSubscription } from "@/hooks/useChecklistSubscription";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

const CheckListCard = ({
  checklistData: initialChecklistData,
  onToggle,
  theme,
  isCurrentUser,
  currentMessage,
}) => {
  const { user } = useAuth();
  const progress = useRef(new Animated.Value(0)).current;

  // Use the subscription hook with the initial data
  const { checklistData, checkedByUserMap, loading } = useChecklistSubscription(
    currentMessage._id || currentMessage.id,
    initialChecklistData?.checklist?.id
  );

  // Use the real-time data if available, otherwise fall back to initial data
  const displayData = checklistData || initialChecklistData;

  const total = displayData?.items?.length || 0;
  const done = displayData?.items?.filter((item) => item.checked).length || 0;
  const percent = total > 0 ? (done / total) * 100 : 0;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: percent,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  if (!displayData || loading) {
    return <View />;
  }

  return (
    <View
      style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}
    >
      <ThemeText
        style={[
          styles.title,
          {
            color: theme.colors.text,
          },
        ]}
      >
        {displayData.checklist?.title || "Checklist"}
      </ThemeText>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressWidth,
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      </View>

      {displayData.items?.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => onToggle(item.id, !item.checked)}
          style={styles.item}
        >
          <View
            style={[
              styles.checkBox,
              {
                backgroundColor: item.checked
                  ? theme.colors.text
                  : "transparent",
                borderColor: item.checked
                  ? theme.colors.text
                  : theme.colors.grey,
              },
            ]}
          >
            {item.checked && (
              <Ionicons
                name="checkmark"
                size={16}
                color={theme.colors.background}
              />
            )}
          </View>
          <ThemeText style={[styles.label, { color: theme.colors.text }]}>
            {item.content ? getShortContent(item.content, 30) : ""}
          </ThemeText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: 300,
    minHeight: 200,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 15,
  },
});

export default CheckListCard;
