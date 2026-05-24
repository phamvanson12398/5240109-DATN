// Prompt service for AI chat - builds prompts and formats context/responses
import { getFrontendBaseUrl } from "../config/runtimeConfig.js";

/**
 * Format product context for AI prompt - enriched for Stylist & Shopping assistant
 * @param {Array} products - Filtered product list
 * @returns {string}
 */
export function formatProductContext(products) {
    return products.map((p, i) => {
        const stockStatus = p.stock > 0 ? (p.stock <= 5 ? `Sắp hết (Chỉ còn ${p.stock})` : 'Còn hàng') : 'Hết hàng';
        const category = p.category
            ? `${p.category.level1} > ${p.category.level2} > ${p.category.level3}`
            : 'N/A';
        const saleInfo = p.originalPrice > p.price 
            ? ` | GIẢM GIÁ: -${Math.round((1 - p.price / p.originalPrice) * 100)}% (Giá gốc: ${p.originalPrice.toLocaleString('vi-VN')}đ)` 
            : '';
        const imageUrl = p.images?.[0]?.url || '';
        const trendingTag = p.trending ? ' [HOT 🔥 - XU HƯỚNG]' : '';

        return `[SẢN PHẨM ${i + 1}]
ID: ${p._id}
Tên: ${p.name}${trendingTag}
Giá bán: ${p.price.toLocaleString('vi-VN')}đ${saleInfo}
Hạng mục: ${category}
Vibe: ${p.vibe || 'Chưa xác định'} | Style: ${p.style || 'Chưa xác định'}
Thương hiệu: ${p.brand || 'N/A'} | Chất liệu: ${p.material || 'N/A'}
Đặc điểm: ${p.sizes?.length > 0 ? `Size: ${p.sizes.join('/')}` : ''} | ${p.colors?.length > 0 ? `Màu: ${p.colors.join('/')}` : ''}
Tình trạng: ${stockStatus} | Đã bán: ${p.sold} | Đánh giá: ${p.ratings}/5
Ảnh: ${imageUrl}
Mô tả: ${(p.description || '').substring(0, 150)}...`;
    }).join("\n\n---\n\n");
}

/**
 * Format conversation history for AI context
 * @param {Array} history - [{role, content}, ...]
 * @returns {string|null}
 */
export function formatHistoryContext(history) {
    if (!history || history.length === 0) return null;
    const recent = history.slice(-6);
    return recent.map(msg => {
        const role = msg.role === 'user' ? 'Khách' : 'Góc Sách';
        return `${role}: ${msg.content}`;
    }).join("\n");
}

/**
 * Build the full prompt for Gemini - Personal Stylist Pro (Ver 2.0)
 */
export function buildPrompt({ productContext, historyContext, userMessage, includeShopInfo, userName = "bạn" }) {
    const isFirstMessage = !historyContext;
    const frontendUrl = getFrontendBaseUrl();

    const SYSTEM_INSTRUCTION = `BẠN LÀ "Sách" - CHUYÊN GIA TẠO MẪU & TƯ VẤN PHONG CÁCH CÁ NHÂN (PERSONAL STYLIST PRO).
Mục tiêu: Biến trải nghiệm mua sắm của ${userName} thành một hành trình thời trang đẳng cấp.

QUY TẮC CỐ ĐỊNH (PHẢI TUÂN THỦ):
1. MỖI SẢN PHẨM GỢI Ý PHẢI CÓ LINK MUA HÀNG. 
   - Định dạng: [Tên SP - Giá](${frontendUrl}/product/\${ID})
   - Nút chốt đơn: [THÊM VÀO GIỎ HÀNG NGAY 🛒](${frontendUrl}/cart/add/\${ID})
2. KHÔNG ĐƯỢC chỉ viết tên sản phẩm suông. Nếu không có link, người dùng không thể mua được.
3. PHỐI ĐỒ: Luôn gợi ý 2-3 món tạo thành 1 Outfit hoàn chỉnh.

VÍ DỤ PHẢN HỒI CHUẨN:
"Chào Ngọc! Với phong cách Streetwear, Sách gợi ý bộ này nhé:
- [Áo Hoodie đen - 350.000đ](${frontendUrl}/product/123)
- [Quần Cargo - 450.000đ](${frontendUrl}/product/456)
- [THÊM ÁO VÀO GIỎ 🛒](${frontendUrl}/cart/add/123)
- [THÊM QUẦN VÀO GIỎ 🛒](${frontendUrl}/cart/add/456)"

NHÂN CÁCH: Chuyên nghiệp, sành điệu, sử dụng icon (✨, 👕, 👟). Chủ động hỏi Chiều cao/Cân nặng để tư vấn size.`;

    const historySection = historyContext ? `
HISTORY CONTEXT:
${historyContext}
` : '';

    return `${SYSTEM_INSTRUCTION}

AVAILABLE PRODUCTS (CONTEXT):
${productContext}

${historySection}

USER QUESTION: "${userMessage}"
💬 Sách PERSONAL STYLIST RESPONSE:`;
}

/**
 * Format AI response - clean up unwanted patterns
 * @param {string} rawResponse
 * @returns {string}
 */
export function formatResponse(rawResponse) {
    return rawResponse
        .trim()
        .replace(/^(Trả lời:|Phản hồi:|Bot:|ChatBot:)/i, '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/╔═.*═╗/g, '')
        .replace(/╚═.*═╝/g, '')
        .trim();
}

/**
 * Filter available (in-stock) products
 */
export function filterAvailableProducts(products) {
    return products.filter(p => p.stock > 0);
}

/**
 * Get best-selling products
 */
export function getBestSellers(products, limit = 3) {
    return products
        .filter(p => p.stock > 0)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, limit);
}
