import { supabase } from "@/lib/supabase";
import { addParticipant, removeParticipant } from "@/services/chatService";

export const carpoolService = {
  async getCarpools(filters = {}) {
    const { status = "scheduled", ...otherFilters } = filters;

    let query = supabase
      .from("carpools")
      .select(
        `
        *,
        driver:driver_id (
          id,
          username,
          first_name,
          last_name,
          image_url
        ),
        car:car_id (
          id,
          make,
          model,
          color,
          seats
        ),
        passengers:carpool_passengers (
          id,
          user_id,
          status
        )
      `
      )
      .eq("status", status)
      .order("departure_time", { ascending: true });

    // Apply additional filters
    Object.entries(otherFilters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getCarpool(id) {
    const { data, error } = await supabase
      .from("carpools")
      .select(
        `
        *,
        driver:driver_id (
          id,
          username,
          first_name,
          last_name,
          image_url
        ),
        car:car_id (
          id,
          make,
          model,
          color,
          seats
        ),
        passengers:carpool_passengers (
          id,
          user_id,
          status,
          user:user_id (
            id,
            username,
            first_name,
            last_name,
            image_url
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createCarpool(carpoolData) {
    console.log("[createCarpool] Starting carpool creation", carpoolData);
    // Remove chat_room_id if present
    const { chat_room_id, ...carpoolDataWithoutChatRoom } = carpoolData;
    // Create the carpool without chat_room_id
    const { data, error } = await supabase
      .from("carpools")
      .insert(carpoolDataWithoutChatRoom)
      .select()
      .single();
    if (error) {
      console.error("[createCarpool] Error inserting carpool:", error);
      throw error;
    }
    console.log("[createCarpool] Carpool inserted:", data);
    return data;
  },

  async updateCarpool(id, updates) {
    // Remove chat_room_id if present
    const { chat_room_id, ...updatesWithoutChatRoom } = updates;
    const { data, error } = await supabase
      .from("carpools")
      .update({
        ...updatesWithoutChatRoom,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCarpool(id) {
    const { error } = await supabase.from("carpools").delete().eq("id", id);

    if (error) throw error;
  },

  async joinCarpool(carpoolId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("carpool_passengers")
      .insert([
        {
          carpool_id: carpoolId,
          user_id: user.id,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    // Add participant to chat
    const { data: carpool } = await supabase
      .from("carpools")
      .select("chat_room_id, driver_id")
      .eq("id", carpoolId)
      .single();
    if (carpool?.chat_room_id && carpool?.driver_id && data?.user_id) {
      await addParticipant(
        carpool.chat_room_id,
        carpool.driver_id,
        data.user_id
      );
    }
    return data;
  },

  async leaveCarpool(carpoolId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    console.log("[leaveCarpool] User:", user.id, "Carpool:", carpoolId);

    // Remove the user from carpool_passengers
    const { data: deleteResult, error: deleteError } = await supabase
      .from("carpool_passengers")
      .delete()
      .eq("carpool_id", carpoolId)
      .eq("user_id", user.id)
      .select();
    if (deleteError) {
      console.error("[leaveCarpool] Error deleting passenger:", deleteError);
      throw deleteError;
    }
    console.log("[leaveCarpool] Deleted passenger:", deleteResult);

    // Remove participant from chat if chat_room_id exists
    const { data: carpool, error: carpoolError } = await supabase
      .from("carpools")
      .select("chat_room_id")
      .eq("id", carpoolId)
      .single();
    if (carpoolError) {
      console.error(
        "[leaveCarpool] Error fetching carpool for chat_room_id:",
        carpoolError
      );
    } else {
      console.log("[leaveCarpool] Carpool fetched:", carpool);
    }
    if (carpool?.chat_room_id) {
      console.log(
        "[leaveCarpool] Removing user from chat:",
        carpool.chat_room_id,
        user.id
      );
      await removeParticipant(carpool.chat_room_id, user.id);
    }
    return deleteResult;
  },

  async updatePassengerStatus(carpoolId, userId, status) {
    const { data, error } = await supabase
      .from("carpool_passengers")
      .update({ status })
      .eq("carpool_id", carpoolId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMyCarpools() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("carpools")
      .select(
        `
        *,
        car:car_id (
          id,
          make,
          model,
          color,
          seats
        ),
        passengers:carpool_passengers (
          id,
          user_id,
          status,
          user:user_id (
            id,
            username,
            first_name,
            last_name,
            image_url
          )
        )
      `
      )
      .or(`driver_id.eq.${user.id},carpool_passengers.user_id.eq.${user.id}`)
      .order("departure_time", { ascending: true });

    if (error) throw error;
    return data;
  },
};
