import { useCallback, useState } from "react";

const initialFilters = {
  status: [],
  type: [],
  minAmount: "",
  maxAmount: "",
  startDate: "",
  endDate: "",
  expiryStart: "",
  expiryEnd: "",
  search: "",
  page: 1,
  limit: 10,
};

export const useVoucherFilters = () => {
  const [filters, setFilters] = useState(initialFilters);

  const calculateActiveCount = useCallback(() => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.type.length > 0) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    if (filters.startDate || filters.endDate) count++;
    if (filters.expiryStart || filters.expiryEnd) count++;
    return count;
  }, [filters]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  return {
    filters,
    activeCount: calculateActiveCount(),
    updateFilters,
    resetFilters,
  };
};
