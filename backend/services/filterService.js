// Filter service for AI chat - validates input and filters relevant products

/**
 * Filter products relevant to user's question
 * Adapted for fashion e-commerce (clothing, shoes, accessories)
 * @param {Array} products - All products from DB
 * @param {string} userMessage - User's message
 * @returns {Array} - Filtered products
 */
export function filterRelevantProducts(products, userMessage) {
    const msg = userMessage.toLowerCase();
    let filtered = [...products];

    // 1. Filter by CATEGORY (level1: Nam/Nữ/Unisex)
    const genderKeywords = {
        "nam": ["nam", "con trai", "đàn ông", "men"],
        "nữ": ["nữ", "con gái", "phụ nữ", "women"],
        "unisex": ["unisex"]
    };
    for (const [gender, keywords] of Object.entries(genderKeywords)) {
        if (keywords.some(k => msg.includes(k))) {
            const genderFiltered = filtered.filter(p =>
                p.category?.level1?.toLowerCase().includes(gender)
            );
            if (genderFiltered.length > 0) {
                filtered = genderFiltered;
                break;
            }
        }
    }

    // 2. Filter by PRODUCT TYPE (level2: Áo/Quần/Giày...)
    const typeKeywords = ["áo", "quần", "giày", "dép", "túi", "balo", "mũ", "nón", "phụ kiện",
        "shirt", "pants", "shoes", "bag"];
    for (const type of typeKeywords) {
        if (msg.includes(type)) {
            const typeFiltered = filtered.filter(p =>
                (p.category?.level2 || '').toLowerCase().includes(type) ||
                (p.name || '').toLowerCase().includes(type)
            );
            if (typeFiltered.length > 0) {
                filtered = typeFiltered;
                break;
            }
        }
    }

    // 3. Filter by BRAND
    const brands = ["nike", "adidas", "uniqlo", "zara", "h&m", "gucci", "puma", "converse",
        "vans", "louis vuitton", "balenciaga", "new balance"];
    for (const brand of brands) {
        if (msg.includes(brand)) {
            const brandFiltered = filtered.filter(p =>
                (p.brand || '').toLowerCase().includes(brand) ||
                (p.name || '').toLowerCase().includes(brand)
            );
            if (brandFiltered.length > 0) {
                filtered = brandFiltered;
                break;
            }
        }
    }

    // 4. Filter by BUDGET
    const pricePatterns = [
        /(\d+)\s*(triệu|tr|trieu)/i,
        /(\d+)tr/i,
        /dưới\s*(\d+)/i,
        /khoảng\s*(\d+)/i,
        /tầm\s*(\d+)/i
    ];
    for (const pattern of pricePatterns) {
        const match = msg.match(pattern);
        if (match) {
            const budget = parseInt(match[1]) * 1000000;
            filtered = filtered.filter(p =>
                p.price >= budget * 0.7 && p.price <= budget * 1.3
            );
            break;
        }
    }

    // Also check patterns like "dưới 500k", "200 ngàn"
    const kPatterns = [
        /(\d+)\s*(k|nghìn|ngàn|nghin)/i,
        /dưới\s*(\d+)\s*(k|nghìn|ngàn)/i
    ];
    for (const pattern of kPatterns) {
        const match = msg.match(pattern);
        if (match) {
            const budget = parseInt(match[1]) * 1000;
            filtered = filtered.filter(p =>
                p.price >= budget * 0.5 && p.price <= budget * 1.5
            );
            break;
        }
    }

    // 5. Filter by MATERIAL
    const materials = ["cotton", "len", "lụa", "vải", "da", "jean", "denim", "kaki", "linen", "polyester"];
    for (const mat of materials) {
        if (msg.includes(mat)) {
            const matFiltered = filtered.filter(p =>
                (p.material || '').toLowerCase().includes(mat) ||
                (p.description || '').toLowerCase().includes(mat)
            );
            if (matFiltered.length > 0) {
                filtered = matFiltered;
                break;
            }
        }
    }

    // 6. Filter by VIBE & STYLE (Personal Stylist Upgrade)
    const styleKeywords = ["streetwear", "minimalism", "vintage", "office", "y2k", "old money", "sporty", "thời trang", "phong cách"];
    const vibeKeywords = ["bí ẩn", "năng động", "quyến rũ", "phóng khoáng", "thanh lịch", "trẻ trung", "chill", "sang trọng"];
    
    let styleMatch = styleKeywords.find(s => msg.includes(s));
    let vibeMatch = vibeKeywords.find(v => msg.includes(v));

    if (styleMatch || vibeMatch) {
        const personalityFiltered = filtered.filter(p => 
            (styleMatch && (p.style || '').toLowerCase().includes(styleMatch)) ||
            (vibeMatch && (p.vibe || '').toLowerCase().includes(vibeMatch))
        );
        if (personalityFiltered.length > 0) {
            filtered = personalityFiltered;
        }
    }

    // 6. Prioritize in-stock products
    const inStock = filtered.filter(p => p.stock > 0);
    if (inStock.length > 0) {
        filtered = inStock;
    }

    // 7. Limit to avoid excessively long AI context
    const MAX_PRODUCTS = 15;
    if (filtered.length > MAX_PRODUCTS) {
        filtered.sort((a, b) => a.price - b.price);
        const step = Math.floor(filtered.length / MAX_PRODUCTS);
        filtered = filtered.filter((_, index) => index % step === 0).slice(0, MAX_PRODUCTS);
    }

    // Fallback to all products if filter too aggressive
    if (filtered.length === 0) {
        console.log("⚠️ No filtered products, using all");
        return products.slice(0, MAX_PRODUCTS);
    }

    console.log(`✅ Filtered: ${filtered.length}/${products.length} products`);
    return filtered;
}

/**
 * Validate user input
 * @param {string} userMessage
 * @returns {{valid: boolean, message?: string}}
 */
export function validateInput(userMessage) {
    if (!userMessage || typeof userMessage !== 'string') {
        return {
            valid: false,
            message: "Bạn muốn hỏi gì ạ? 😊"
        };
    }

    const trimmed = userMessage.trim();

    if (trimmed.length === 0) {
        return {
            valid: false,
            message: "Bạn muốn hỏi gì ạ? 😊"
        };
    }

    if (trimmed.length > 500) {
        return {
            valid: false,
            message: "Câu hỏi hơi dài quá bạn ơi 😅 Bạn có thể nói ngắn gọn hơn được không?"
        };
    }

    // Filter spam/offensive content
    const spamPatterns = /(.)\\1{10,}|^[^a-zA-Z0-9\\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+$/;
    if (spamPatterns.test(trimmed)) {
        return {
            valid: false,
            message: "Mình không hiểu lắm, bạn có thể hỏi rõ hơn được không? 🤔"
        };
    }

    return { valid: true };
}
