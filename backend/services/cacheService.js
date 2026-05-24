// Cache service for AI chat - caches product data in memory
import { getAllProducts } from "./productService.js";

// In-memory product cache
let cachedProducts = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get products with caching to reduce DB load
 * @returns {Promise<Array>}
 */
export async function getProducts() {
    const now = Date.now();

    if (cachedProducts && cacheTime && (now - cacheTime < CACHE_DURATION)) {
        console.log("📦 Using cached products");
        return cachedProducts;
    }

    console.log("🔄 Fetching fresh products from DB");
    cachedProducts = await getAllProducts();
    cacheTime = now;

    return cachedProducts;
}

/**
 * Clear cache (call when products are updated)
 */
export function clearCache() {
    cachedProducts = null;
    cacheTime = null;
    console.log("🗑️ Product cache cleared");
}
