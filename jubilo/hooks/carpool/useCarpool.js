import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export const useCarpools = () => {
  const [carpools, setCarpools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCarpools();
  }, []);

  const fetchCarpools = async () => {
    try {
      setIsLoading(true);
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
            brand,
            model,
            color,
            seats
          )
        `
        )
        .eq("status", "scheduled")
        .order("departure_time", { ascending: true });

      if (error) throw error;
      setCarpools(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createCarpool = async (carpoolData) => {
    try {
      const { data, error } = await supabase
        .from("carpools")
        .insert([carpoolData])
        .select()
        .single();

      if (error) throw error;
      setCarpools((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCarpool = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("carpools")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setCarpools((prev) =>
        prev.map((carpool) => (carpool.id === id ? data : carpool))
      );
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCarpool = async (id) => {
    try {
      const { error } = await supabase.from("carpools").delete().eq("id", id);

      if (error) throw error;
      setCarpools((prev) => prev.filter((carpool) => carpool.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    carpools,
    isLoading,
    error,
    createCarpool,
    updateCarpool,
    deleteCarpool,
    refreshCarpools: fetchCarpools,
  };
};
