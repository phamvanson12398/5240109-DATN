
class APIFunctionality {
    /**
     * @param {mongoose.Query} query   
     * @param {Object}         queryStr 
     */
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }


    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,  // tìm kiếm gần đúng
                $options: "i"                    // không phân biệt hoa/thường
            }
        } : {};

        this.query = this.query.find({ ...keyword });
        return this; // trả về this để chain tiếp
    }

    static CATEGORY_MAP = {
    };

    filter() {
        const queryCopy = { ...this.queryStr };

        // Bước 1: Xóa các field không phải filter
        const removeFields = ["keyword", "page", "limit", "sort"];
        removeFields.forEach(key => delete queryCopy[key]);


        let categoryQuery = {};
        if (queryCopy.category) {
            const mapped = APIFunctionality.CATEGORY_MAP[queryCopy.category];

            if (mapped) {
                categoryQuery = { ...mapped };
            } else {
                // Fallback: tìm kiếm gần đúng trên cả level1 và level2
                categoryQuery = {
                    $or: [
                        {
                            'category.level1': {
                                $regex: queryCopy.category,
                                $options: 'i'
                            }
                        },
                        {
                            'category.level2': {
                                $regex: queryCopy.category,
                                $options: 'i'
                            }
                        }
                    ]
                };
            }
            delete queryCopy.category;
        }

        // Bước 3: Xử lý stock=true → chỉ lấy sản phẩm còn hàng
        if (queryCopy.stock === "true") {
            queryCopy.stock = { $gt: 0 };
        } else {
            delete queryCopy.stock;
        }

        // Bước 4: Convert operators cho price, ratings
        // Express parse: price[gte]=100 → { price: { gte: "100" } }
        // MongoDB cần:                  → { price: { $gte: 100 } }
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);

        const queryObj = JSON.parse(queryStr);

        // Bước 4: Convert string numbers thành Number cho MongoDB
        // Vì query params đến dưới dạng string: "100000" → cần convert thành 100000
        const convertToNumber = (obj) => {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    convertToNumber(obj[key]);
                } else if (!isNaN(obj[key]) && typeof obj[key] === 'string' && obj[key].trim() !== '') {
                    obj[key] = Number(obj[key]);
                }
            }
        };
        convertToNumber(queryObj);

        // Merge category query (đã map) với các filter khác
        this.query = this.query.find({ ...queryObj, ...categoryQuery });
        return this;
    }


    sort() {
        if (this.queryStr.sort) {
            // Cho phép sort nhiều field: "price,-createdAt" → "price -createdAt"
            const sortBy = this.queryStr.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            // Mặc định: sản phẩm mới nhất lên trước
            this.query = this.query.sort("-createdAt");
        }
        return this;
    }


    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}

export default APIFunctionality;