import askGemini from "../utils/geminiUtils.js";
import { getProducts } from "./cacheService.js";
import { filterRelevantProducts, validateInput } from "./filterService.js";
import {
    formatProductContext,
    formatHistoryContext,
    buildPrompt,
    ensureProductLinks,
    formatResponse
} from "./aiPromptService.js";
import { logInteraction } from "./analyticsService.js";

const normalizeText = (value = "") =>
    String(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .trim();

const GREETING_MESSAGES = new Set([
    "hello",
    "hi",
    "xin chao",
    "chao",
    "chao shop",
    "alo"
]);

const isGreetingOnly = (message = "") => {
    const normalized = normalizeText(message).replace(/[!?.。]+$/g, "").trim();
    return GREETING_MESSAGES.has(normalized);
};

export async function askChatbot(userMessage, conversationHistory = [], options = {}) {
    const startedAt = Date.now();

    try {
        const validation = validateInput(userMessage);

        if (!validation.valid) {
            return validation.message;
        }

        if (isGreetingOnly(userMessage)) {
            return "Chào bạn, Góc Sách rất vui được hỗ trợ bạn. Bạn đang muốn tìm sách theo thể loại, tác giả hay nhu cầu đọc nào hôm nay?";
        }

        const products = await getProducts();

        const relevantProducts = filterRelevantProducts(products, userMessage);
        console.log("relevantProducts", relevantProducts);
        const productContext = formatProductContext(relevantProducts);

        const historyContext = formatHistoryContext(conversationHistory);
        console.log("productContext", productContext);

        const prompt = buildPrompt({
            productContext,
            historyContext,
            userMessage,
            userName: options.userName,
            includeShopInfo: options.includeShopInfo !== false
        });

        console.log("[AI Chat] prompt prepared", {
            products: relevantProducts.length,
            promptChars: prompt.length,
            prepMs: Date.now() - startedAt
        });

        const response = await askGemini(prompt);

        if (!response || response.trim().length === 0) {
            return "Xin lỗi bạn, mình đang gặp chút vấn đề kỹ thuật. Bạn thử hỏi lại sau vài giây nhé!";
        }

        if (options.enableAnalytics) {
            await logInteraction(userMessage, response, relevantProducts);
        }

        console.log(`[AI Chat] completed duration=${Date.now() - startedAt}ms`);

        return ensureProductLinks(formatResponse(response), relevantProducts);
    } catch (error) {
        console.error("Chatbot error:", {
            name: error?.name,
            code: error?.code,
            status: error?.status,
            duration: Date.now() - startedAt,
            message: error?.debugMessage || error?.message
        });

        throw error;
    }
}

export { clearCache } from "./cacheService.js";