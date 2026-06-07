import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const DEFAULT_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 20000);
const DEFAULT_MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES || 2);

let cachedClient = null;
let cachedModel = null;
let cachedApiKey = null;
let cachedModelName = null;

export class GeminiRequestError extends Error {
    constructor({
        message,
        userMessage,
        debugMessage,
        status = 500,
        code = "GEMINI_REQUEST_FAILED",
        model = DEFAULT_GEMINI_MODEL,
        retryable = false,
        cause = null
    }) {
        super(message);
        this.name = "GeminiRequestError";
        this.userMessage = userMessage;
        this.debugMessage = debugMessage;
        this.status = status;
        this.code = code;
        this.model = model;
        this.retryable = retryable;
        this.cause = cause;
    }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryDelay = (attempt) => Math.min(1000 * Math.pow(2, attempt - 1), 5000);

const withTimeout = (promise, timeoutMs, modelName) => {
    let timeoutId;

    const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new GeminiRequestError({
                message: "Gemini request timed out",
                userMessage: "Góc Sách đang phản hồi hơi lâu. Bạn thử lại sau nhé.",
                debugMessage: `Gemini did not respond within ${timeoutMs}ms.`,
                status: 504,
                code: "GEMINI_TIMEOUT",
                model: modelName,
                retryable: true
            }));
        }, timeoutMs);
    });

    return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

const getModel = (modelName) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new GeminiRequestError({
            message: "Missing Gemini API key",
            userMessage: "Backend chưa cấu hình Gemini API key.",
            debugMessage: "GEMINI_API_KEY is missing.",
            status: 500,
            code: "GEMINI_API_KEY_MISSING",
            model: modelName,
            retryable: false
        });
    }

    if (!cachedClient || cachedApiKey !== apiKey) {
        cachedClient = new GoogleGenerativeAI(apiKey);
        cachedApiKey = apiKey;
        cachedModel = null;
        cachedModelName = null;
    }

    if (!cachedModel || cachedModelName !== modelName) {
        cachedModel = cachedClient.getGenerativeModel({
            model: modelName,
            generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.35,
                topP: 0.9
            }
        });
        cachedModelName = modelName;
    }

    return cachedModel;
};

const buildGeminiError = (error, modelName, fallbackMessage = "Unknown Gemini error") => {
    if (error instanceof GeminiRequestError) return error;

    const status = error?.status || error?.httpStatusCode || 500;
    const rawMessage = (error?.message || fallbackMessage).replace(/\s+/g, " ").trim();

    if (status === 404) {
        return new GeminiRequestError({
            message: "Gemini model is unavailable",
            userMessage: "Model AI hiện tại không khả dụng. Kiểm tra GEMINI_MODEL hoặc restart backend.",
            debugMessage: rawMessage,
            status,
            code: "GEMINI_MODEL_NOT_FOUND",
            model: modelName,
            retryable: false,
            cause: error
        });
    }

    if (status === 401 || status === 403) {
        return new GeminiRequestError({
            message: "Gemini authentication failed",
            userMessage: "Gemini API key không hợp lệ hoặc chưa có quyền với model này.",
            debugMessage: rawMessage,
            status,
            code: "GEMINI_AUTH_FAILED",
            model: modelName,
            retryable: false,
            cause: error
        });
    }

    if (status === 429) {
        return new GeminiRequestError({
            message: "Gemini rate limited",
            userMessage: "Bạn đã gửi quá nhiều yêu cầu đến Gemini. Vui lòng thử lại sau.",
            debugMessage: rawMessage,
            status,
            code: "GEMINI_RATE_LIMITED",
            model: modelName,
            retryable: true,
            cause: error
        });
    }

    if (status === 503 && /high demand|service unavailable/i.test(rawMessage)) {
        return new GeminiRequestError({
            message: "Gemini is under high demand",
            userMessage: "Góc Sách đang hơi bận một chút. Bạn vui lòng thử lại sau nhé.",
            debugMessage: rawMessage,
            status,
            code: "GEMINI_HIGH_DEMAND",
            model: modelName,
            retryable: true,
            cause: error
        });
    }

    if (/fetch failed/i.test(rawMessage)) {
        return new GeminiRequestError({
            message: "Gemini network request failed",
            userMessage: "Backend chưa kết nối được tới Gemini API. Kiểm tra mạng hoặc API key.",
            debugMessage: rawMessage,
            status,
            code: "GEMINI_NETWORK_ERROR",
            model: modelName,
            retryable: true,
            cause: error
        });
    }

    return new GeminiRequestError({
        message: "Gemini request failed",
        userMessage: "Gemini đang gặp lỗi khi xử lý. Bạn thử lại sau nhé.",
        debugMessage: rawMessage,
        status,
        code: "GEMINI_REQUEST_FAILED",
        model: modelName,
        retryable: status >= 500,
        cause: error
    });
};

async function askGemini(prompt, maxRetries = DEFAULT_MAX_RETRIES) {
    const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    const model = getModel(modelName);
    const startedAt = Date.now();

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
        try {
            const result = await withTimeout(
                model.generateContent(prompt),
                DEFAULT_TIMEOUT_MS,
                modelName
            );
            const text = result.response.text();
            console.log(`[Gemini] success model=${modelName} attempt=${attempt} duration=${Date.now() - startedAt}ms`);
            return text;
        } catch (error) {
            const geminiError = buildGeminiError(error, modelName);

            if (geminiError.retryable && attempt < maxRetries) {
                const delay = getRetryDelay(attempt);
                console.warn("[Gemini] retrying request", {
                    attempt,
                    maxRetries,
                    status: geminiError.status,
                    code: geminiError.code,
                    delay,
                    model: modelName
                });
                await sleep(delay);
                continue;
            }

            console.error("[Gemini] request failed", {
                attempt,
                maxRetries,
                status: geminiError.status,
                code: geminiError.code,
                model: geminiError.model,
                retryable: geminiError.retryable,
                duration: Date.now() - startedAt,
                message: geminiError.debugMessage
            });

            throw geminiError;
        }
    }
}

export default askGemini;
