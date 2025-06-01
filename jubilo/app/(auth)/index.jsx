import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemeText from "../../components/theme/ThemeText";
import { useTheme } from "../../hooks/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const FEATURES = [
  {
    id: "1",
    title: "Social Feed",
    description:
      "Connect with your community and stay updated with local events and news",
    icon: "\ud83d\udcf1",
  },
  {
    id: "2",
    title: "Carpooling",
    description: "Share rides and reduce your carbon footprint",
    icon: "\ud83d\ude97",
  },
  {
    id: "3",
    title: "Marketplace",
    description: "Buy and sell items within your community",
    icon: "\ud83d\udecd\ufe0f",
  },
  {
    id: "4",
    title: "Chats",
    description: "Communicate directly with neighbors and community members",
    icon: "\ud83d\udcac",
  },
  {
    id: "5",
    title: "Event Management",
    description: "Create and manage community events easily",
    icon: "\ud83d\udcc5",
  },
];

export default function Welcome() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef < ScrollView > null;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Header */}
      <View>
        <Image
          source={require("@/assets/images/welcomescreen1.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemeText style={[styles.title, { color: theme.colors.text }]}>
          Welcome to Jubilo
        </ThemeText>
        <ThemeText style={[styles.subtitle, { color: theme.colors.grey }]}>
          Uniting the joy
        </ThemeText>
      </View>

      {/* Features Scroll */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flexGrow: 0, marginBottom: 16 }}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {FEATURES.map((feature) => (
          <View
            key={feature.id}
            style={{
              width: SCREEN_WIDTH - 32,
              paddingHorizontal: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 64 }}>{feature.icon}</Text>
            <ThemeText
              style={{
                fontSize: 20,
                fontWeight: "bold",
                textAlign: "center",
                marginTop: 16,
              }}
            >
              {feature.title}
            </ThemeText>
            <ThemeText
              style={{
                textAlign: "center",
                color: theme.colors.grey,
                marginTop: 8,
              }}
            >
              {feature.description}
            </ThemeText>
          </View>
        ))}
      </ScrollView>

      {/* Indicator Dots */}
      <View style={styles.dotsContainer}>
        {FEATURES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  activeIndex === index
                    ? theme.colors.primary
                    : theme.colors.grey,
              },
            ]}
          />
        ))}
      </View>

      {/* Footer */}
      <View>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          style={styles.loginLink}
        >
          <ThemeText>Don't have an account?</ThemeText>
          <ThemeText color={theme.colors.primary}>Sign up</ThemeText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  logo: {
    height: 200,
    width: "100%",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  button: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: "space-between",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 4,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 0,
  },
  dot: {
    width: 20,
    height: 3,
    borderRadius: 0,
  },
});
