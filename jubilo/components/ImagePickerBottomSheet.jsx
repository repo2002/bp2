import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import BottomSheetModal from "./BottomSheetModal";

const MAX_IMAGES = 6;

const ImagePickerBottomSheet = React.forwardRef(
  ({ initialSelected = [], onConfirm }, ref) => {
    const [assets, setAssets] = useState([]);
    const [selected, setSelected] = useState(initialSelected);
    const theme = useTheme();

    useEffect(() => {
      (async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") return;
        const { assets } = await MediaLibrary.getAssetsAsync({
          mediaType: ["photo"],
          sortBy: [["creationTime", false]],
          first: 100,
        });
        setAssets(assets);
      })();
    }, []);

    // Keep selection when reopened
    useEffect(() => {
      setSelected(initialSelected);
    }, [initialSelected]);

    const toggleSelect = (asset) => {
      let updated;
      if (selected.find((a) => a.id === asset.id)) {
        updated = selected.filter((a) => a.id !== asset.id);
      } else if (selected.length < MAX_IMAGES) {
        updated = [...selected, asset];
      } else {
        updated = selected;
      }
      setSelected(updated);
    };

    const handleConfirm = () => {
      onConfirm(selected);
      ref.current?.close();
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={["75%"]}
        title="Select Images"
        showConfirm={true}
        confirmText="Add Images"
        onConfirm={handleConfirm}
      >
        <FlatList
          data={assets}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => toggleSelect(item)}
              style={styles.imageWrapper}
            >
              <Image
                source={{ uri: item.uri }}
                key={item.id}
                style={[
                  styles.image,
                  selected.find((a) => a.id === item.id) && {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  },
                ]}
              />
              {selected.find((a) => a.id === item.id) && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.primary}
                  style={styles.checkOverlay}
                />
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
        <ThemeText style={{ marginTop: 8, color: theme.colors.grey }}>
          {selected.length} / {MAX_IMAGES} selected
        </ThemeText>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  imageWrapper: {
    margin: 4,
    position: "relative",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  checkOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
  },
});

export default ImagePickerBottomSheet;
