import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  ScrollView,
  Animated,
} from "react-native";
import ThemeText from "./ThemeText";
import { useTheme } from "../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

type TabIcon = {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
};

type Tab = {
  key: string;
  title?: string;
  icon?: TabIcon;
  content: React.ReactNode;
};

type Props = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
};

const Tabs: React.FC<Props> = ({ tabs, activeTab, onTabChange }) => {
  const theme = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const tabWidth = screenWidth / tabs.length;
  const scrollViewRef = React.useRef<ScrollView>(null);
  const scrollX = React.useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const scrollToTab = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
  };

  React.useEffect(() => {
    const index = tabs.findIndex((tab) => tab.key === activeTab);
    if (index !== -1) {
      scrollToTab(index);
    }
  }, [activeTab]);

  const renderTabIndicator = () => {
    const translateX = scrollX.interpolate({
      inputRange: tabs.map((_, i) => i * screenWidth),
      outputRange: tabs.map((_, i) => i * tabWidth),
    });

    return (
      <Animated.View
        style={[
          styles.indicator,
          {
            width: tabWidth,
            transform: [{ translateX }],
            backgroundColor: theme.colors.primary,
          },
        ]}
      />
    );
  };

  const renderTabContent = (tab: Tab, isActive: boolean) => {
    const iconColor = isActive ? theme.colors.primary : theme.colors.text;
    const textColor = isActive ? theme.colors.primary : theme.colors.text;

    return (
      <View style={styles.tabContent}>
        {tab.icon && (
          <Ionicons
            name={tab.icon.name}
            size={tab.icon.size || 24}
            color={iconColor}
            style={tab.title ? styles.tabIcon : undefined}
          />
        )}
        {tab.title && (
          <ThemeText
            style={[
              styles.tabText,
              { color: textColor },
              isActive && { fontWeight: "600" },
            ]}
          >
            {tab.title}
          </ThemeText>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {tabs.map((tab, index) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => {
                onTabChange(tab.key);
                scrollToTab(index);
              }}
              style={[styles.tabItem, { width: tabWidth }]}
            >
              {renderTabContent(tab, isActive)}
            </TouchableOpacity>
          );
        })}
        {renderTabIndicator()}
      </View>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.contentContainer}
      >
        {tabs.map((tab) => (
          <View key={tab.key} style={[styles.page, { width: screenWidth }]}>
            {tab.content}
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
  },
  tabRow: {
    flexDirection: "row",
    width: "100%",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    position: "relative",
  },
  tabItem: {
    paddingVertical: 12,
    alignItems: "center",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    marginRight: 4,
  },
  tabText: {
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    height: 2,
    borderRadius: 1,
  },
});

export default Tabs;
