import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";

export function useImageCache(imageUrl) {
  const [cachedUri, setCachedUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    const cacheImage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Generate a unique filename based on the URL
        const filename = imageUrl.split("/").pop();
        const path = `${FileSystem.cacheDirectory}${filename}`;

        // Check if image is already cached
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists) {
          setCachedUri(path);
          setLoading(false);
          return;
        }

        // Download and cache image
        await FileSystem.downloadAsync(imageUrl, path);
        setCachedUri(path);
      } catch (err) {
        console.error("Error caching image:", err);
        setError(err);
        setCachedUri(imageUrl); // Fallback to original URL
      } finally {
        setLoading(false);
      }
    };

    cacheImage();
  }, [imageUrl]);

  return {
    cachedUri: cachedUri || imageUrl,
    loading,
    error,
  };
}
