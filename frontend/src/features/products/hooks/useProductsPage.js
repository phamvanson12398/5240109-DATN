import useProductListing from "./useProductListing";

/**
 * useProductsPage Hook
 * Extends the existing useProductListing logic for the new luxury UI
 */
export function useProductsPage() {
  const listing = useProductListing();

  // Any extra transformation logic for the new UI can go here
  // For example, finding the active category labels from a hierarchy
  
  return {
    ...listing,
    // Add any UI-specific flags or derived data if needed
  };
}

export default useProductsPage;
