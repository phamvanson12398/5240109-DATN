import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Review from '../models/reviewModel.js';
import HandleError from '../utils/handleError.js';
import handleAsyncError from '../middleware/handleAsyncError.js';
import APIFunctionality from '../utils/apiFunctionality.js';
import { getRelatedProductsLevel1 } from '../services/productRecommendationService.js';



import { v2 as cloudinary } from 'cloudinary';


const uploadReviewMedia = async (files = []) => {
    const mediaFiles = Array.isArray(files) ? files : [files];
    const uploadedMedia = [];

    for (const file of mediaFiles) {
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "reviews",
                    resource_type: "auto"
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(file.data);
        });

        uploadedMedia.push({
            public_id: result.public_id,
            url: result.secure_url,
            resource_type: result.resource_type || "image"
        });
    }

    return uploadedMedia;
};
// tao san pham 
export const createProducts = handleAsyncError(async (req, res, next) => {
    console.log(req.body);

    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else if (res.req.files && res.req.files.images) {

        const files = Array.isArray(res.req.files.images) ? res.req.files.images : [res.req.files.images];

    } else {
        // No images
    }

    const imagesLinks = [];

    // Kiểm tra xem có file trong req.files không
    if (req.files && req.files.images) {
        const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

        for (let i = 0; i < files.length; i++) {

            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "products" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(files[i].data);
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
    }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;


    if (typeof req.body.category === 'string') {
        try {
            req.body.category = JSON.parse(req.body.category);
        } catch (error) {

            return next(new HandleError("Dữ liệu category không hợp lệ, vui lòng gửi dạng Object {level1, level2, level3}", 400));
        }
    }

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })
})


// Lấy tất cả sản phẩm 
export const getAllProducts = handleAsyncError(async (req, res, next) => {
    const resultPerPage = 12

    const apiFeatures = new APIFunctionality(Product.find(), req.query)
        .search().filter().sort()

    // lọc filter trước khi phân trang 
    const filteredQuery = apiFeatures.query.clone()  // tạo bản sao của query để đếm số lượng sản phẩm sau khi filter
    const productCount = await filteredQuery.countDocuments()

    // tổng số sản phẩm sau khi filter 
    const totalPages = Math.ceil(productCount / resultPerPage)

    const page = Number(req.query.page) || 1
    if (page > totalPages && productCount > 0) {
        return next(new HandleError("Trang không tồn tại", 404))

    }
    // phân trang 
    apiFeatures.pagination(resultPerPage);
    const products = await apiFeatures.query;

    let relatedProducts = [];
    let hasResults = products.length > 0;

    // Nếu không có kết quả, gọi service gợi ý (Level 1)
    if (!hasResults) {
        // Lấy category từ query (nếu có map trong APIFunctionality)
        // Lưu ý: APIFunctionality.CATEGORY_MAP là static nên ta có thể dùng để trích xuất level1,2
        const mappedCategory = req.query.category ? APIFunctionality.CATEGORY_MAP[req.query.category] : null;
        relatedProducts = await getRelatedProductsLevel1({
            category: mappedCategory || {
                level1: req.query.level1,
                level2: req.query.level2,
            },
            limit: 8
        });
    }
    res.status(200).json({
        success: true,
        products,
        productCount,
        resultPerPage,
        totalPages,
        currentPage: page,
        hasResults,
        relatedProducts,
        message: hasResults ? "Tìm kiếm thành công" : "Không tìm thấy sản phẩm phù hợp"
    });
})

// --- HAM UPDATE SAN PHAM (DA TOI UU) ---

export const updateProduct = handleAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new HandleError("Sản phẩm không tồn tại", 404));
    }


    // 1. Xử lý Hình ảnh
    let images = [];
    if (req.body.oldImages) {
        try {
            const oldImages = JSON.parse(req.body.oldImages);
            if (Array.isArray(oldImages)) images = [...oldImages];
        } catch (e) { console.error("Lỗi parse oldImages:", e); }
    }

    if (req.files && req.files.images) {
        const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        for (let i = 0; i < files.length; i++) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: "products" }, (error, result) => {
                    if (error) reject(error); else resolve(result);
                });
                uploadStream.end(files[i].data);
            });
            images.push({ public_id: result.public_id, url: result.secure_url });
        }
    }

    // 2. Cập nhật các trường cơ bản
    const fields = ["name", "description", "price", "originalPrice", "stock", "publisher", "author", "publishYear", "language", "page"];
    fields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });

    // 3. Category & Arrays
    if (req.body.category) {
        product.category = typeof req.body.category === "string" ? JSON.parse(req.body.category) : req.body.category;
    }

    // 4. [FIX CHỐT] Cập nhật AI STYLIST
    if (req.body.keyword !== undefined) product.keyword = String(req.body.keyword).trim();

    if (images.length > 0) product.images = images;

    // Lưu và Log kết quả
    await product.save();
    console.log(req.body);

    console.log("Sản phẩm sau khi SAVE:", { keyword: product.keyword });
    console.log("----------------------------------");
    console.log(product);

    res.status(200).json({
        success: true,
        product,
        _sach_debug: {
            received_vibe: req.body.vibe,
            received_style: req.body.style,
            schema_keys: Object.keys(Product.schema.paths)
        }
    });
});
// Xóa sản phẩm 
export const deteteProduct = handleAsyncError(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
        return next(new HandleError("Sản phẩm không tồn tại", 404))
    }
    res.status(200).json({
        succes: true,
        message: " Xóa sản phẩm thành công"
    })
})

// truy cập sản phẩm đơn lẻ 
export const getSingleProduct = handleAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new HandleError("Sản phẩm không tồn tại", 404))
    }
    const relatedProducts = await getRelatedProductsLevel1({
        category: product.category,
        limit: 4,
        excludeProductId: product._id
    });
    res.status(200).json({
        success: true,
        product,
        relatedProducts
    })
})

// Tạo hoặc cập nhật đánh giá sản phẩm (lưu vào Collection Review riêng biệt)
export const createReviewProduct = handleAsyncError(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    // Only allow users who purchased AND received the product to review
    const orders = await Order.find({
        user_id: req.user._id,
        "orderItems.product_id": productId,
        orderStatus: "Đã giao"
    });

    if (orders.length === 0) {
        return next(new HandleError("Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công.", 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
        return next(new HandleError("Sản phẩm không tồn tại", 404));
    }
    const uploadedMedia = req.files?.images
        ? await uploadReviewMedia(req.files.images)
        : [];


    // Check if review already exists for this user + product
    const existingReview = await Review.findOne({
        user_id: req.user._id,
        product_id: productId
    });

    let isUpdate = false;
    if (existingReview) {
        // Update existing review
        existingReview.rating = Number(rating);
        existingReview.comment = comment;
        if (uploadedMedia.length > 0) {
            existingReview.images = uploadedMedia;
        }
        await existingReview.save();
        isUpdate = true;
    } else {
        // Create new review document
        await Review.create({
            user_id: req.user._id,
            product_id: productId,
            rating: Number(rating),
            comment,
            images: uploadedMedia,
            status: "approved"
        });
    }

    // Recalculate product ratings from Review collection
    const allReviews = await Review.find({ product_id: productId, status: "approved" });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    product.ratings = allReviews.length > 0 ? totalRating / allReviews.length : 0;
    product.numOfReviews = allReviews.length;
    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: isUpdate ? "Cập nhật đánh giá thành công!" : "Thêm đánh giá thành công"
    });
})

// Lấy các đánh giá của một sản phẩm (từ Collection Review)
export const getReviewProduct = handleAsyncError(async (req, res, next) => {
    const productId = req.query.id;
    const product = await Product.findById(productId);
    if (!product) {
        return next(new HandleError("Sản phẩm không tồn tại", 400));
    }

    const reviews = await Review.find({ product_id: productId, status: "approved" })
        .populate("user_id", "name avatar")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        reviews
    });
})

// Xóa đánh giá sản phẩm (từ Collection Review, rồi cập nhật lại ratings)
export const deleteReviewProduct = handleAsyncError(async (req, res, next) => {
    const { id: reviewId, productId } = req.query;

    const review = await Review.findById(reviewId);
    if (!review) {
        return next(new HandleError("Không tìm thấy đánh giá", 400));
    }

    await Review.findByIdAndDelete(reviewId);

    // Recalculate product ratings after deletion
    const product = await Product.findById(productId);
    if (product) {
        const allReviews = await Review.find({ product_id: productId, status: "approved" });
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        product.ratings = allReviews.length > 0 ? totalRating / allReviews.length : 0;
        product.numOfReviews = allReviews.length;
        await product.save({ validateBeforeSave: false });
    }

    res.status(200).json({
        success: true,
        message: "Xóa thành công đánh giá sản phẩm"
    });
})

// Admin - lấy tất cả sản phẩm 
export const getAdminProducts = handleAsyncError(async (req, res, next) => {
    const products = await Product.find()
    res.status(200).json({
        succes: true,
        products
    })
})

import * as xlsx from 'xlsx';

// Helper function to find the actual header row
const findHeaderRow = (rows) => {
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
        const row = rows[i];
        if (Array.isArray(row) && row.some(cell =>
            typeof cell === 'string' &&
            (cell.toLowerCase().includes('name') || cell.toLowerCase().includes('tên'))
        )) {
            return i;
        }
    }
    return 0; // Default to first row
};

// =============================================
// Admin - Import sản phẩm hàng loạt từ Excel/CSV
// POST /api/v1/admin/products/import
// =============================================
export const importProducts = handleAsyncError(async (req, res, next) => {
    let products = [];

    // Check if a file was uploaded
    if (req.files && req.files.file) {
        const file = req.files.file;

        try {


            // Read the file data into a workbook
            const workbook = xlsx.read(file.data, { type: 'buffer' });

            // Assuming data is in the first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Tìm dòng header thực sự để tránh trường hợp file có tiêu đề trang trí ở dòng 1-3
            const rawRows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
            const headerIdx = findHeaderRow(rawRows);

            // Convert to JSON array starting from the identified header row
            products = xlsx.utils.sheet_to_json(worksheet, {
                range: headerIdx,
                defval: ''
            });

        } catch (error) {
            return next(new HandleError(`Lỗi đọc file: ${error.message}`, 400));
        }
    } else if (req.body.products) {
        // Fallback for direct JSON array
        try {
            products = typeof req.body.products === 'string' ? JSON.parse(req.body.products) : req.body.products;
        } catch (error) {
            return next(new HandleError("Dữ liệu JSON products không hợp lệ", 400));
        }
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
        return next(new HandleError("Không tìm thấy dữ liệu sản phẩm trong file hoặc request", 400));
    }

    const imported = [];
    const updated = [];
    const skipped = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
        const rawItem = products[i];

        const getValue = (keys) => {
            for (const key of keys) {
                if (rawItem[key] !== undefined && rawItem[key] !== null && rawItem[key] !== '') {
                    return rawItem[key];
                }
            }
            return null;
        };

        const item = {
            sku: getValue([
                'sku'
            ]),
            name: getValue([
                'Tên',
                'Tên sản phẩm',
                'Name',
                'name'
            ]),

            description: getValue([
                'Mô Tả',
                'Mô tả',
                'Description',
                'description'
            ]),

            // Giá & kho
            price: getValue([
                'Giá Bán',
                'Giá bán',
                'Price',
                'price'
            ]),

            originalPrice: getValue([
                'Giá Gốc',
                'Giá gốc',
                'Giá niêm yết',
                'Original Price',
                'OriginalPrice',
                'originalPrice',
                'original_price'
            ]),

            stock: getValue([
                'Tồn Kho',
                'Tồn kho',
                'Số lượng',
                'Stock',
                'stock'
            ]),

            sold: getValue([
                'Đã bán',
                'Sold',
                'sold'
            ]),

            // Category 2 cấp
            categoryLevel1: getValue([
                'Danh Mục Cấp 1',
                'Danh mục cấp 1',
                'Category Level 1',
                'level1',
                'category_level1',
                'category.level1'
            ]),

            categoryLevel2: getValue([
                'Danh Mục Cấp 2',
                'Danh mục cấp 2',
                'Category Level 2',
                'level2',
                'category_level2',
                'category.level2'
            ]),

            // Thông tin sách
            publisher: getValue([
                'Nhà xuất bản',
                'Publisher',
                'publisher'
            ]),
            publishYear: getValue([
                'Năm xuất bản',
                'Publish Year',
                'publishYear'
            ]),

            author: getValue([
                "Tác giả",
                "Tac gia",
                "Author",
                "author"
            ]),

            page: getValue([
                "Số trang",
                "So trang",
                "Page",
                "Pages",
                "page",
                "pages",
                "pageCount",
            ]),

            page: getValue([
                'Số trang',
                'So trang',
                'Page',
                'Pages',
                'page',
                'pages',
                'pageCount'
            ]),

            language: getValue([
                'Ngôn ngữ',
                'Language',
                'language'
            ]),

            // Keywords
            keyword: getValue([
                'Từ khóa',
                'Keyword',
                'keyword'
            ]),
        };

        try {
            // Validate required fields

            if (!item.name || !String(item.name).trim()) {
                errors.push({ row: i + 2, name: item.name || '', message: 'Thiếu trường Tên (name)' });
                continue;
            }
            if (!item.description || !String(item.description).trim()) {
                errors.push({ row: i + 2, name: item.name, message: 'Thiếu trường Mô tả (description)' });
                continue;
            }
            if (item.price === null || isNaN(item.price) || Number(item.price) <= 0) {
                errors.push({ row: i + 2, name: item.name, message: 'Trường Giá bán (price) không hợp lệ' });
                continue;
            }
            if (item.stock === null || isNaN(item.stock) || Number(item.stock) < 0) {
                errors.push({ row: i + 2, name: item.name, message: 'Trường Tồn kho (stock) không hợp lệ' });
                continue;
            }
            if (!item.categoryLevel1 || !item.categoryLevel2) {
                const oldCategory = getValue(['Danh mục', 'Category', 'category']);
                if (oldCategory) {
                    errors.push({ row: i + 2, name: item.name, message: 'File mẫu cũ. Cần cập nhật sang 3 cột Danh Mục Cấp 1, 2.' });
                } else {
                    errors.push({ row: i + 2, name: item.name, message: 'Thiếu thông tin Danh mục cấp 1/2' });
                }
                continue;
            }


            const productSku = String(item.sku).trim();
            const productName = String(item.name).trim();

            const productData = {
                sku: productSku,
                name: productName,
                description: String(item.description).trim(),
                price: Number(item.price),
                originalPrice:
                    item.originalPrice !== null &&
                        item.originalPrice !== undefined &&
                        item.originalPrice !== ''
                        ? Number(item.originalPrice)
                        : Number(item.price),
                stock: Number(item.stock),

                category: {
                    level1: String(item.categoryLevel1).trim(),
                    level2: String(item.categoryLevel2).trim(),
                },

                keyword: String(item.keyword || "").trim(),

                publisher: item.publisher ? String(item.publisher).trim() : "No publisher",
                material: item.material ? String(item.material).trim() : "",
                sold: Number(item.sold) || 0,
                language: item.language ? String(item.language).trim() : "Tiếng Việt",
                author: item.author ? String(item.author).trim() : "",
                publishYear: Number(item.publishYear) || null,
                page: item.page ? Number(item.page) : 0,
                user: req.user.id,
            };


            let existingProduct = await Product.findOne({ sku: productSku });

            // Determine import mode for this item
            const importMode = rawItem._importMode || 'auto'; // auto, overwrite, accumulate, skip

            if (existingProduct) {

                if (importMode === 'accumulate') {
                    // Only add stock, keep everything else
                    existingProduct.stock += Number(item.stock);
                    await existingProduct.save({ validateBeforeSave: false });
                    updated.push({
                        ...existingProduct.toObject(),
                        _action: 'accumulate',
                        _addedStock: Number(item.stock)
                    });
                } else {
                    // importMode === 'overwrite' or 'auto' -> full update (keep existing images)
                    const updatedProduct = await Product.findByIdAndUpdate(
                        existingProduct._id,
                        { $set: productData },
                        { new: true, runValidators: true }
                    );
                    updated.push({ ...updatedProduct.toObject(), _action: 'overwrite' });
                }
            } else {
                // Product does not exist -> CREATE NEW with placeholder image
                productData.images = [{
                    public_id: 'placeholder',
                    url: '/placeholder.png'
                }];
                const newProduct = await Product.create(productData);
                imported.push(newProduct);
            }
        } catch (err) {
            errors.push({ row: i + 2, name: item.name || '', message: err.message });
        }
    }

    res.status(200).json({
        success: true,
        imported: imported.length,
        updated: updated.length,
        skipped: skipped.length,
        failed: errors.length,
        errors,
        skippedItems: skipped,
        products: [...imported, ...updated]
    });
})

// =============================================

// Admin - Cập nhật sản phẩm hàng loạt từ Excel/CSV
// PUT /api/v1/admin/products/update-bulk
// =============================================
export const updateProductsBulk = handleAsyncError(async (req, res, next) => {
    let products = [];

    // Check if a file was uploaded
    if (req.files && req.files.file) {
        const file = req.files.file;
        try {
            const workbook = xlsx.read(file.data, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            products = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
        } catch (error) {
            return next(new HandleError(`Lỗi đọc file: ${error.message}`, 400));
        }
    } else if (req.body.products) {
        try {
            products = typeof req.body.products === 'string' ? JSON.parse(req.body.products) : req.body.products;
        } catch (error) {
            return next(new HandleError("Dữ liệu JSON products không hợp lệ", 400));
        }
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
        return next(new HandleError("Không tìm thấy dữ liệu sản phẩm trong file hoặc request", 400));
    }

    const updated = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
        const rawItem = products[i];
        const getValue = (keys) => {
            for (const key of keys) {
                if (rawItem[key] !== undefined && rawItem[key] !== null && rawItem[key] !== '') {
                    return rawItem[key];
                }
            }
            return null;
        };

        const id = getValue(['Product ID', '_id', 'ID', 'Id', 'id']);
        const name = getValue(['Tên', 'Tên sản phẩm', 'Name', 'name']);

        if (!id) {
            errors.push({ row: i + 2, name: name || 'Không rõ', message: 'Thiếu trường ID sản phẩm (Product ID)' });
            continue;
        }

        const product = await Product.findById(id);
        if (!product) {
            errors.push({ row: i + 2, name: name || id, message: `Không tìm thấy sản phẩm có ID: ${id}` });
            continue;
        }

        const updateData = {};

        const price = getValue(['Giá Bán', 'Giá bán', 'Price', 'price']);
        if (price !== null && !isNaN(price)) updateData.price = Number(price);

        const originalPrice = getValue(['Giá Gốc', 'Giá gốc', 'Original Price', 'originalPrice']);
        if (originalPrice !== null && !isNaN(originalPrice)) updateData.originalPrice = Number(originalPrice);

        const stock = getValue(['Tồn Kho', 'Tồn kho', 'Số lượng', 'Stock', 'stock']);
        if (stock !== null && !isNaN(stock)) updateData.stock = Number(stock);

        const desc = getValue(['Mô Tả', 'Mô tả', 'Description', 'description']);
        if (desc) updateData.description = String(desc).trim();

        const pName = getValue(['Tên', 'Tên sản phẩm', 'Name', 'name']);
        if (pName) updateData.name = String(pName).trim();

        const catL1 = getValue(['Danh Mục Cấp 1', 'Danh mục cấp 1', 'Category Level 1', 'level1', 'category_level1', 'category.level1']);
        const catL2 = getValue(['Danh Mục Cấp 2', 'Danh mục cấp 2', 'Category Level 2', 'level2', 'category_level2', 'category.level2']);

        if (catL1 || catL2) {
            updateData.category = {
                level1: String(catL1 || product.category.level1).trim(),
                level2: String(catL2 || product.category.level2).trim(),
            }
        }

        const publisher = getValue([
            'Nhà xuất bản',
            'Publisher',
            'publisher'
        ]);

        if (publisher !== null) {
            updateData.publisher = String(publisher).trim();
        }

        const publishYear = getValue([
            'Năm xuất bản',
            'Publish Year',
            'publishYear'
        ]);

        if (publishYear !== null) {
            updateData.publishYear = Number(publishYear);
        }

        const page = getValue([
            'Số trang',
            'Page',
            'page'
        ]);

        if (page !== null) {
            updateData.page = Number(page);
        }

        const language = getValue([
            'Ngôn ngữ',
            'Language',
            'language'
        ]);

        if (language !== null) {
            updateData.language = String(language).trim();
        }

        const status = getValue([
            'Trạng thái',
            'Status',
            'status'
        ]);

        if (status !== null) {
            updateData.status = String(status).trim();
        }

        const keyword = getValue([
            'Từ khóa',
            'Keyword',
            'keyword'
        ]);

        if (keyword !== null) {

            if (Array.isArray(keyword)) {
                updateData.keyword = keyword;
            } else {
                updateData.keyword = String(keyword)
                    .split(',')
                    .map(item => item.trim())
                    .filter(Boolean);
            }
        }
        try {
            const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            });
            updated.push(updatedProduct);
        } catch (err) {
            errors.push({ row: i + 2, name: pName || id, message: err.message });
        }
    }

    res.status(200).json({
        success: true,
        updated: updated.length,
        failed: errors.length,
        errors,
        products: updated
    });
})

// =============================================
// Admin - Import tồn kho hàng loạt (cập nhật stock theo tên SP)
// PUT /api/v1/admin/products/import-stock
// =============================================
export const importStock = handleAsyncError(async (req, res, next) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return next(new HandleError("Danh sách nhập hàng trống", 400));
    }

    const updated = [];
    const notFound = [];

    for (const item of items) {
        if (!item.name || !item.quantity || isNaN(item.quantity) || Number(item.quantity) <= 0) {
            notFound.push({ name: item.name || '(trống)', reason: 'Tên hoặc số lượng không hợp lệ' });
            continue;
        }

        // Search by exact name (case-insensitive)
        const product = await Product.findOne({
            name: { $regex: `^${item.name.trim()}$`, $options: 'i' }
        });

        if (!product) {
            notFound.push({ name: item.name, reason: 'Không tìm thấy sản phẩm' });
            continue;
        }

        product.stock += Number(item.quantity);
        await product.save({ validateBeforeSave: false });
        updated.push({
            _id: product._id,
            name: product.name,
            oldStock: product.stock - Number(item.quantity),
            addedQty: Number(item.quantity),
            newStock: product.stock
        });
    }

    res.status(200).json({
        success: true,
        updated: updated.length,
        notFound,
        details: updated
    });
})

// =============================================
// Admin - Cập nhật tồn kho 1 sản phẩm
// PUT /api/v1/admin/products/:id/stock
// =============================================
export const updateStock = handleAsyncError(async (req, res, next) => {
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(quantity) || Number(quantity) <= 0) {
        return next(new HandleError("Số lượng nhập không hợp lệ", 400));
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new HandleError("Sản phẩm không tồn tại", 404));
    }

    product.stock += Number(quantity);
    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        product
    });
})

// =============================================
// Admin - Tìm kiếm sản phẩm theo tên
// GET /api/v1/admin/products/search?name=áo
// =============================================
export const searchProducts = handleAsyncError(async (req, res, next) => {
    const { name } = req.query;

    if (!name || !name.trim()) {
        return next(new HandleError("Vui lòng nhập tên sản phẩm để tìm kiếm", 400));
    }

    const products = await Product.find({
        name: { $regex: name.trim(), $options: 'i' }
    }).select('_id name stock price category images');

    res.status(200).json({
        success: true,
        products
    });
})


export const importProductsPreCheck = handleAsyncError(async (req, res, next) => {
    const { skus } = req.body;

    if (!skus || !Array.isArray(skus) || skus.length === 0) {
        return next(new HandleError("Danh sách SKU trống", 400));
    }

    const results = [];

    for (const sku of skus) {
        if (!sku || !String(sku).trim()) {
            results.push({ sku: sku || '', exists: false });
            continue;
        }

        const trimmedSku = String(sku).trim();
        const existingProduct = await Product.findOne({
            sku: { $regex: `^${trimmedSku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
        }).select('_id name sku stock price');

        if (existingProduct) {
            results.push({
                sku: trimmedSku,
                name: existingProduct.name,
                exists: true,
                _id: existingProduct._id,
                currentStock: existingProduct.stock,
                currentPrice: existingProduct.price,
                currentVibe: existingProduct.vibe || "N/A",
                currentStyle: existingProduct.style || "N/A"
            });
        } else {
            results.push({
                sku: trimmedSku,
                exists: false
            });
        }
    }

    const existCount = results.filter(r => r.exists).length;
    const newCount = results.filter(r => !r.exists).length;

    res.status(200).json({
        success: true,
        total: results.length,
        existCount,
        newCount,
        results
    });
})