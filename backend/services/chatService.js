import askGemini from "../utils/geminiUtils.js";
import { getProducts } from "./cacheService.js";
import { filterRelevantProducts, validateInput } from "./filterService.js";
import {
    formatProductContext,
    formatHistoryContext,
    buildPrompt,
    formatResponse
} from "./aiPromptService.js";
import { logInteraction } from "./analyticsService.js";

export async function askChatbot(userMessage, conversationHistory = [], options = {}) {
    try {
        const validation = validateInput(userMessage);
        if (!validation.valid) {
            return validation.message;
        }

        const products = await getProducts();
        const relevantProducts = filterRelevantProducts(products, userMessage);
        const productContext = formatProductContext(relevantProducts);
        const historyContext = formatHistoryContext(conversationHistory);

        const prompt = buildPrompt({
            productContext,
            historyContext,
            userMessage,
            userName: options.userName,
            includeShopInfo: options.includeShopInfo !== false
        });

        const response = await askGemini(prompt);

        if (!response || response.trim().length === 0) {
            return "Xin loi ban, minh dang gap chut van de ky thuat. Ban thu hoi lai sau vai giay nhe!";
        }

        if (options.enableAnalytics) {
            await logInteraction(userMessage, response, relevantProducts);
        }

        return formatResponse(response);
    } catch (error) {
        console.error("Chatbot error:", {
            name: error?.name,
            code: error?.code,
            status: error?.status,
            message: error?.debugMessage || error?.message
        });
        throw error;
    }
}

export { clearCache } from "./cacheService.js";
