import { supabase } from "@/lib/supabase";

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const carpool = {
      ...carpoolData,
      driver_id: user.id,
      status: "scheduled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("carpools")
      .insert([carpool])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCarpool(id, updates) {
    const { data, error } = await supabase
      .from("carpools")
      .update({
        ...updates,
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
    return data;
  },

  async leaveCarpool(carpoolId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("carpool_passengers")
      .delete()
      .eq("carpool_id", carpoolId)
      .eq("user_id", user.id);

    if (error) throw error;
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
