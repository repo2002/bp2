import { supabase } from "@/lib/supabase";

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
    try {
      // First upload the image if it exists
      let imageUrl = null;
      if (carData.image) {
        const imageExt = carData.image.split(".").pop();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id;
        const imagePath = `${userId}/${Date.now()}.${imageExt}`;

        const { data: imageData, error: imageError } = await supabase.storage
          .from("cars")
          .upload(imagePath, {
            uri: carData.image,
            type: `image/${imageExt}`,
            name: imagePath,
          });

        if (imageError) throw imageError;
        imageUrl = imagePath; // Store the path instead of public URL
      }

      // Create the car record
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("cars")
        .insert([
          {
            make: carData.make,
            model: carData.model,
            color: carData.color,
            license_plate: carData.licensePlate,
            seats: carData.seats,
            image: imageUrl,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating car:", error);
      throw error;
    }
  },

  async updateCar(id, updates) {
    const { licensePlate, image, ...rest } = updates;
    const dbUpdates = {
      ...rest,
      license_plate: licensePlate,
    };

    // If there's a new image, upload it first
    if (image) {
      const imageExt = image.split(".").pop();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;
      const imagePath = `${userId}/${Date.now()}.${imageExt}`;

      // Upload new image
      const { error: uploadError } = await supabase.storage.from("cars").upload(
        imagePath,
        {
          uri: image,
          type: `image/${imageExt}`,
          name: imagePath,
        },
        {
          upsert: true, // This will replace the existing file if it exists
        }
      );

      if (uploadError) throw uploadError;
      dbUpdates.image = imagePath;
    }

    const { data, error } = await supabase
      .from("cars")
      .update(dbUpdates)
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

  // Get signed URL for car image with 7-day expiration
  async getCarImageUrl(imagePath) {
    if (!imagePath) return null;

    const { data, error } = await supabase.storage
      .from("cars")
      .createSignedUrl(imagePath, 604800); // URL valid for 7 days (7 * 24 * 60 * 60)

    if (error) {
      console.error("Error getting signed URL:", error);
      return null;
    }

    return data.signedUrl;
  },
};
