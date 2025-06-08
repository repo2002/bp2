import { carpoolService } from "@/services/carpool/carpoolService";
import { useCallback, useState } from "react";

export const useCarpool = () => {
  const [carpools, setCarpools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCarpools = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await carpoolService.getCarpools(filters);
      setCarpools(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCarpool = useCallback(async (carpoolData) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await carpoolService.createCarpool(carpoolData);
      setCarpools((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCarpool = useCallback(async (id, updates) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await carpoolService.updateCarpool(id, updates);
      setCarpools((prev) =>
        prev.map((carpool) => (carpool.id === id ? data : carpool))
      );
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCarpool = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      await carpoolService.deleteCarpool(id);
      setCarpools((prev) => prev.filter((carpool) => carpool.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinCarpool = useCallback(
    async (carpoolId) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await carpoolService.joinCarpool(carpoolId);
        // Refresh the carpool list to get updated passenger information
        await fetchCarpools();
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCarpools]
  );

  const leaveCarpool = useCallback(
    async (carpoolId) => {
      try {
        setIsLoading(true);
        setError(null);
        await carpoolService.leaveCarpool(carpoolId);
        // Refresh the carpool list to get updated passenger information
        await fetchCarpools();
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCarpools]
  );

  const updatePassengerStatus = useCallback(
    async (carpoolId, userId, status) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await carpoolService.updatePassengerStatus(
          carpoolId,
          userId,
          status
        );
        // Refresh the carpool list to get updated passenger information
        await fetchCarpools();
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCarpools]
  );

  const getMyCarpools = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await carpoolService.getMyCarpools();
      setCarpools(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    carpools,
    isLoading,
    error,
    fetchCarpools,
    createCarpool,
    updateCarpool,
    deleteCarpool,
    joinCarpool,
    leaveCarpool,
    updatePassengerStatus,
    getMyCarpools,
  };
};
