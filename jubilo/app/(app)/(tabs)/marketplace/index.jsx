import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ITEMS = [
  {
    id: "1",
    title: "Vintage Bookshelf",
    price: "$120",
    image: "https://images.unsplash.com/photo-1532372320572-cda25653a26f?w=500",
    seller: {
      name: "Alex Morgan",
      avatar: "https://i.pravatar.cc/150?img=7",
    },
    location: "2 miles away",
  },
  {
    id: "2",
    title: "Gaming Console",
    price: "$250",
    image: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=500",
    seller: {
      name: "Chris Lee",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
    location: "1 mile away",
  },
  {
    id: "3",
    title: "Bicycle",
    price: "$180",
    image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=500",
    seller: {
      name: "Maria Garcia",
      avatar: "https://i.pravatar.cc/150?img=9",
    },
    location: "3 miles away",
  },
];

export default function Marketplace() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.itemCard, { backgroundColor: theme.colors.card }]}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <ThemeText style={styles.itemTitle}>{item.title}</ThemeText>
          <ThemeText
            style={[styles.itemPrice, { color: theme.colors.primary }]}
          >
            {item.price}
          </ThemeText>
        </View>

        <View style={styles.sellerInfo}>
          <Image source={{ uri: item.seller.avatar }} style={styles.avatar} />
          <View style={styles.sellerDetails}>
            <ThemeText style={styles.sellerName}>{item.seller.name}</ThemeText>
            <View style={styles.locationContainer}>
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.colors.grey}
              />
              <ThemeText
                style={[styles.location, { color: theme.colors.grey }]}
              >
                {item.location}
              </ThemeText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <ThemeText style={styles.title}>Marketplace</ThemeText>
        <TouchableOpacity style={styles.createButton}>
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={ITEMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.itemsList}
        showsVerticalScrollIndicator={false}
        numColumns={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  itemsList: {
    padding: 8,
  },
  itemCard: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  itemContent: {
    padding: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: "500",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 12,
  },
});
