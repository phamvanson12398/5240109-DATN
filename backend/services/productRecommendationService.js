import Product from '../models/productModel.js';

export const getRelatedProductsLevel1 = async ({
    author,
    publisher,
    category,
    limit = 8,
    excludeProductId,
} = {}) => {
    const results = [];
    const addedIds = new Set();

    const appendUniqueProducts = (products) => {
        for (const item of products) {
            const id = item._id.toString();

            if (!addedIds.has(id) && results.length < limit) {
                addedIds.add(id);
                results.push(item);
            }
        }
    };

    const baseFilter = {
        status: "available",
        stock: { $gt: 0 },
    };

    if (excludeProductId) {
        baseFilter._id = { $ne: excludeProductId };
    }

    // 1. Cùng danh mục con / thể loại chi tiết
    if (results.length < limit && category?.level2) {
        const products = await Product.find({
            ...baseFilter,
            "category.level2": category.level2,
        })
            .sort({ sold: -1, ratings: -1, createdAt: -1 })
            .limit(limit);

        appendUniqueProducts(products);
    }

    // 2. Cùng tác giả
    if (results.length < limit && author) {
        const products = await Product.find({
            ...baseFilter,
            author,
        })
            .sort({ sold: -1, ratings: -1, createdAt: -1 })
            .limit(limit);

        appendUniqueProducts(products);
    }

    // 3. Cùng nhà xuất bản
    if (results.length < limit && publisher) {
        const products = await Product.find({
            ...baseFilter,
            publisher,
        })
            .sort({ sold: -1, ratings: -1, createdAt: -1 })
            .limit(limit);

        appendUniqueProducts(products);
    }

    // 4. Cùng danh mục cha
    if (results.length < limit && category?.level1) {
        const products = await Product.find({
            ...baseFilter,
            "category.level1": category.level1,
        })
            .sort({ sold: -1, ratings: -1, createdAt: -1 })
            .limit(limit);

        appendUniqueProducts(products);
    }

    // 5. Sách bán chạy
    if (results.length < limit) {
        const products = await Product.find(baseFilter)
            .sort({ sold: -1, ratings: -1, createdAt: -1 })
            .limit(limit);

        appendUniqueProducts(products);
    }

    // 6. Sách mới nhất
    if (results.length < limit) {
        const products = await Product.find(baseFilter)
            .sort({ createdAt: -1 })
            .limit(limit);

        appendUniqueProducts(products);
    }

    return results;
};