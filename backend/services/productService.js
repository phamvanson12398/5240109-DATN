// Product service for AI chat - fetches products from MongoDB
import Product from "../models/productModel.js";

/**
 * Get all products (lean query for performance)
 * @returns {Promise<Array>} Array of product objects
 */
export async function getAllProducts() {
    return await Product.find()
        .select("name description price originalPrice stock sold category brand material sizes colors ratings numOfReviews images")
        .lean();
}

/**
 * Get product by ID
 * @param {string} id - MongoDB ObjectId
 * @returns {Promise<Object|null>}
 */
export async function getProductById(id) {
    return await Product.findById(id).lean();
}
