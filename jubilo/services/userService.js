import { supabase } from "../lib/supabase";

export const getUserData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
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
