const NO_MATCH_SENTINEL = "KHÔNG_CÓ_SÁCH_PHÙ_HỢP";

const formatCurrency = (value = 0) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function formatProductContext(products = []) {
  if (!Array.isArray(products) || products.length === 0) {
    return NO_MATCH_SENTINEL;
  }

  return products
    .map((product, index) => {
      const productUrl = `/product/${product._id}`;
      const cartUrl = `/cart/add/${product._id}`;

      const category = product.category
        ? [product.category.level1, product.category.level2]
            .filter(Boolean)
            .join(" > ")
        : "N/A";

      const stockStatus =
        Number(product.stock || 0) > 0 ? `còn ${product.stock}` : "hết hàng";

      const saleInfo =
        Number(product.originalPrice || 0) > Number(product.price || 0)
          ? `, đang giảm ${Math.round(
              (1 - product.price / product.originalPrice) * 100
            )}%`
          : "";

      return `${index + 1}. ID nội bộ: ${product._id}
Tên sách: ${product.name}
Giá: ${formatCurrency(product.price)}${saleInfo}
Link mua: ${productUrl}
Link thêm giỏ: ${cartUrl}
Danh mục: ${category}
Tác giả: ${product.author || "N/A"}
Nhà xuất bản: ${product.publisher || "N/A"}
Năm xuất bản: ${product.publishYear || "N/A"}
Số trang: ${product.page || "N/A"}
Ngôn ngữ: ${product.language || "N/A"}
Từ khóa: ${
        Array.isArray(product.keyword)
          ? product.keyword.join(", ")
          : product.keyword || "N/A"
      }
Mô tả: ${product.description || "N/A"}
Tồn kho: ${stockStatus}
Đã bán: ${product.sold || 0}
Đánh giá: ${product.ratings || 0}/5`;
    })
    .join("\n---\n");
}

export function formatHistoryContext(history = []) {
  if (!Array.isArray(history) || history.length === 0) return null;

  return history
    .slice(-4)
    .map((message) => {
      const role = message.role === "user" ? "Khách" : "Sach";
      return `${role}: ${String(message.content || "").slice(0, 220)}`;
    })
    .join("\n");
}

export function buildPrompt({
  productContext,
  historyContext,
  userMessage,
  includeShopInfo,
  userName = "bạn",
}) {
  void includeShopInfo;

  const historySection = historyContext
    ? `\nLỊCH SỬ CHAT:\n${historyContext}\n`
    : "";

  return `Bạn là Sach, chatbot tư vấn sách thông minh của website Góc Sách.

VAI TRÒ:
- Bạn là trợ lý tư vấn mua sách.
- Hỗ trợ khách tìm sách theo tên sách, thể loại, tác giả, nhà xuất bản, ngôn ngữ, ngân sách và nhu cầu đọc.
- Trả lời tự nhiên, thân thiện, giống nhân viên tư vấn nhà sách.
- Luôn trả lời bằng tiếng Việt.

QUY TẮC BẮT BUỘC:
1. Chỉ được sử dụng sách có trong DANH SÁCH SẢN PHẨM được cung cấp.
2. Không tự bịa sách, giá, tác giả, nhà xuất bản, thể loại, tồn kho hoặc khuyến mãi.
3. Không nói rằng bạn là AI, Gemini hoặc chatbot của Google.
4. Trả lời ngắn gọn, tự nhiên, tối đa khoảng 120 từ.
5. Ưu tiên sách còn hàng, phù hợp nhu cầu, bán chạy hoặc đang giảm giá.
6. Không hiển thị ID nội bộ cho khách.
7. Khi gợi ý sách, bắt buộc dùng Markdown link: [Tên sách - Giá](Link mua)
8. Link mua phải lấy đúng từ dòng "Link mua".
9. Nếu gợi ý thêm vào giỏ hàng, dùng: [Thêm vào giỏ hàng](Link thêm giỏ)
10. Không trả lời câu hỏi ngoài phạm vi sách hoặc mua sắm tại Góc Sách.

CHÀO HỎI:
- Nếu khách chỉ chào hỏi, hãy chào lại thân thiện.
- Không cần gợi ý sách nếu khách chưa nói nhu cầu.

TƯ VẤN SÁCH:
- Nếu khách hỏi sách hay, sách nên đọc, sách cho người mới bắt đầu, sách học tập, sách thiếu nhi, sách kỹ năng, sách kinh doanh, tiểu thuyết, truyện tranh hoặc sách làm quà, hãy gợi ý sách phù hợp.
- Có thể gợi ý theo thể loại, tác giả, nhà xuất bản, ngôn ngữ, độ tuổi hoặc mục tiêu đọc.
- Chỉ dùng sách có trong danh sách sản phẩm.

NGÂN SÁCH:
- Nếu khách hỏi khoảng 100k, dưới 200k, giá rẻ hoặc ngân sách thấp, chỉ gợi ý tối đa 3 sách phù hợp nhất.

KHI KHÁCH HỎI QUÁ CHUNG:
- Nếu khách nói "tư vấn cho tôi", "chọn giúp tôi", "tôi không biết mua sách gì", hãy hỏi thêm khách thích thể loại nào, mua cho ai, mục tiêu đọc là gì và ngân sách bao nhiêu.

NGOÀI PHẠM VI:
- Nếu khách hỏi toán học, code, chính trị, hack, tin tức hoặc nội dung không liên quan sách/mua sắm, trả lời:
"Sach hiện chuyên hỗ trợ tư vấn sách và mua sắm tại Góc Sách. Bạn muốn tìm sách theo thể loại, tác giả hay nhu cầu đọc nào hôm nay không?"

LỊCH SỬ CHAT:
- Nếu có lịch sử trò chuyện, tận dụng thông tin cũ.
- Không hỏi lại điều khách đã nói.
- Không chào lại ở mỗi phản hồi nếu cuộc trò chuyện đã bắt đầu.
- Trả lời tự nhiên như đang trò chuyện với ${userName}.

KHI KHÔNG CÓ SẢN PHẨM:
- Nếu dữ liệu sản phẩm là ${NO_MATCH_SENTINEL}, trả lời:
"Sách chưa tìm thấy sách phù hợp với nhu cầu của bạn. Bạn có thể mô tả thêm về thể loại, tác giả, độ tuổi, ngân sách hoặc mục tiêu đọc để Sach hỗ trợ tốt hơn nhé."

DANH SÁCH SẢN PHẨM:
${productContext}
${historySection}

CÂU HỎI CỦA KHÁCH:
"${userMessage}"

SÁCH TRẢ LỜI:`;
}

export function formatResponse(rawResponse = "") {
  return rawResponse
    .trim()
    .replace(/^(Trả lời:|Phản hồi:|Bot:|ChatBot:|Sach:|Sach TRẢ LỜI:)/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function ensureProductLinks(rawResponse = "", products = []) {
  if (!rawResponse || !Array.isArray(products) || products.length === 0) {
    return rawResponse;
  }

  const markdownLinkPattern = /(\[[^\]]+\]\([^)]+\))/g;
  const segments = String(rawResponse).split(markdownLinkPattern);

  const sortedProducts = [...products]
    .filter((product) => product?._id && product?.name)
    .sort((a, b) => String(b.name).length - String(a.name).length);

  return segments
    .map((segment) => {
      if (markdownLinkPattern.test(segment)) {
        markdownLinkPattern.lastIndex = 0;
        return segment;
      }

      markdownLinkPattern.lastIndex = 0;
      let linkedSegment = segment;

      for (const product of sortedProducts) {
        const name = String(product.name);
        const price = formatCurrency(product.price);
        const linkText = `${name} - ${price}`;
        const productUrl = `/product/${product._id}`;
        const escapedName = escapeRegExp(name);
        const escapedPrice = escapeRegExp(price);

        const nameWithPricePattern = new RegExp(
          `${escapedName}\\s*-\\s*${escapedPrice}`,
          "gu"
        );

        linkedSegment = linkedSegment.replace(
          nameWithPricePattern,
          `[${linkText}](${productUrl})`
        );

        const plainNamePattern = new RegExp(escapedName, "gu");

        linkedSegment = linkedSegment.replace(
          plainNamePattern,
          (match, offset, fullText) => {
            const before = fullText.slice(Math.max(0, offset - 2), offset);
            const after = fullText.slice(
              offset + match.length,
              offset + match.length + 2
            );

            if (before.includes("[") || after.includes("]")) {
              return match;
            }

            return `[${linkText}](${productUrl})`;
          }
        );
      }

      return linkedSegment;
    })
    .join("");
}

export function filterAvailableProducts(products = []) {
  return products.filter((product) => Number(product.stock || 0) > 0);
}

export function getBestSellers(products = [], limit = 3) {
  return products
    .filter((product) => Number(product.stock || 0) > 0)
    .sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))
    .slice(0, limit);
}