import Product from '../models/productModel.js';

/**
 * Product Recommendation Service (Level 1 - Rule Based)
 * Logic fallback: level3 -> level2 -> level1 -> brand -> sold -> trending -> createdAt
 */
export const getRelatedProductsLevel1 = async ({ brand, category, limit = 8 }) => {
    const results = [];
    const addedIds = new Set();

    // Helper to add unique products to the results array
    const appendUniqueProducts = (products) => {
        for (const item of products) {
            const id = item._id.toString();
            if (!addedIds.has(id) && results.length < limit) {
                addedIds.add(id);
                results.push(item);
            }
        }
    };

    // Base condition: Available and in stock
    const baseFilter = {
        status: "available",
        stock: { $gt: 0 }
    };

    // 1. Cùng category.level3
    if (results.length < limit && category?.level3) {
        const products = await Product.find({ ...baseFilter, "category.level3": category.level3 })
            .sort({ sold: -1, ratings: -1, createdAt: -1 })
            .limit(limit);
        appendUniqueProducts(products);
    }

    // 2. Cùng category.level2
    if (results.length < limit && category?.level2) {
        const products = await Product.find({ ...baseFilter, "category.level2": category.level2 })
            .sort({ sold: -1, ratings: -1, createdAt: -1 })
            .limit(limit);
        appendUniqueProducts(products);
    }

    // 3. Cùng category.level1
    if (results.length < limit && category?.level1) {
        const products = await Product.find({ ...baseFilter, "category.level1": category.level1 })
            .sort({ sold: -1, ratings: -1, createdAt: -1 })
            .limit(limit);
        appendUniqueProducts(products);
    }

    // 4. Cùng Brand
    if (results.length < limit && brand && brand !== "No Brand") {
        const products = await Product.find({ ...baseFilter, brand: brand })
            .sort({ sold: -1, ratings: -1, createdAt: -1 })
            .limit(limit);
        appendUniqueProducts(products);
    }

    // 5. Bán chạy (Sold)
    if (results.length < limit) {
        const products = await Product.find({ ...baseFilter })
            .sort({ sold: -1, ratings: -1, createdAt: -1 })
            .limit(limit);
        appendUniqueProducts(products);
    }

    // 6. Xu hướng (Trending)
    if (results.length < limit) {
        const products = await Product.find({ ...baseFilter, trending: true })
            .sort({ createdAt: -1 })
            .limit(limit);
        appendUniqueProducts(products);
    }

    // 7. Mới nhất (CreatedAt)
    if (results.length < limit) {
        const products = await Product.find({ ...baseFilter })
            .sort({ createdAt: -1 })
            .limit(limit);
        appendUniqueProducts(products);
    }

    return results;
};
