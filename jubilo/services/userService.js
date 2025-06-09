import { supabase } from "../lib/supabase";

export const getUserData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        *,
        followers:followers!followers_following_id_fkey (
          follower:profiles!followers_follower_id_fkey (
            id,
            username,
            first_name,
            last_name,
            image_url
          )
        ),
        following:followers!followers_follower_id_fkey (
          followed:profiles!followers_following_id_fkey (
            id,
            username,
            first_name,
            last_name,
            image_url
          )
        )
      `
      )
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("got error", error);
    return { success: false, msg: error.message };
  }
};

export const updateUserData = async (userId, data) => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId);

    if (error) {
      return { success: false, msg: error.message };
    }
    return { success: true, msg: "User updated successfully" };
  } catch (error) {
    console.log("got error", error);
    return { success: false, msg: error.message };
  }
};
export const getUsers = async () => {
  try {
    const { data, error } = await supabase.from("profiles").select("*");
    return { success: true, data: data };
  } catch (error) {
    console.log("got error", error);
    return { success: false, msg: error.message };
  }
};
