import { supabase } from "../../lib/supabase";

export const carService = {
  async getCars(userId) {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCar(id) {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createCar(carData) {
    const { data, error } = await supabase
      .from("cars")
      .insert([carData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCar(id, updates) {
    const { data, error } = await supabase
      .from("cars")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCar(id) {
    const { error } = await supabase.from("cars").delete().eq("id", id);

    if (error) throw error;
  },

  async getCarHistory(carId) {
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
        )
      `
      )
      .eq("car_id", carId)
      .order("departure_time", { ascending: false });

    if (error) throw error;
    return data;
  },
};
