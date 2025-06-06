import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving to storage", e);
  }
};

export const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error("Error reading from storage", e);
    return null;
  }
};

export const storeUser = async (user) => {
  if (!user?.id) return;
  await storeData(`user_${user.id}`, user);
};

export const getUser = async (userId) => {
  return await getData(`user_${userId}`);
};
