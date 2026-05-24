import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

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

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildGeminiError(error, modelName, fallbackMessage) {
    const status = error?.status || error?.httpStatusCode || 500;
    const rawMessage = (error?.message || fallbackMessage || "Unknown Gemini error")
        .replace(/\s+/g, " ")
        .trim();

    if (status === 404) {
        return {
            message: "Gemini model is unavailable",
            userMessage: "Model AI hien tai khong kha dung. Kiem tra lai model hoac restart backend de nap config moi.",
            debugMessage: rawMessage,
            status,
            code: "GEMINI_MODEL_NOT_FOUND",
            model: modelName,
            retryable: false
        };
    }

    if (status === 401 || status === 403) {
        return {
            message: "Gemini authentication failed",
            userMessage: "Gemini API key khong hop le, da het han, hoac chua co quyen voi model nay.",
            debugMessage: rawMessage,
            status,
            code: "GEMINI_AUTH_FAILED",
            model: modelName,
            retryable: false
        };
    }

    if (status === 429) {
        return {
            message: "Gemini rate limited",
            userMessage: "Gemini dang ban hoac key da cham han muc. Ban thu lai sau it phut nhe.",
            debugMessage: rawMessage,
            status,
            code: "GEMINI_RATE_LIMITED",
            model: modelName,
            retryable: true
        };
    }

    if (/fetch failed/i.test(rawMessage)) {
        return {
            message: "Gemini network request failed",
            userMessage: "Backend chua ket noi duoc toi Gemini API. Kiem tra mang, firewall, proxy, hoac DNS cua server.",
            debugMessage: rawMessage,
            status,
            code: "GEMINI_NETWORK_ERROR",
            model: modelName,
            retryable: true
        };
    }

    return {
        message: "Gemini request failed",
        userMessage: "Gemini dang gap loi khi xu ly. Ban mo debug de xem nguyen nhan cu the nhe.",
        debugMessage: rawMessage,
        status,
        code: "GEMINI_REQUEST_FAILED",
        model: modelName,
        retryable: status >= 500
    };
}

async function askGemini(prompt, maxRetries = 3) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = DEFAULT_GEMINI_MODEL;
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await model.generateContent(prompt);
            return res.response.text();
        } catch (error) {
            const geminiError = buildGeminiError(error, modelName);

            if (geminiError.status === 429 && attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000;
                console.warn(
                    `[Gemini] rate limited. attempt=${attempt}/${maxRetries}, delay=${delay}ms, model=${modelName}`
                );
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
                message: geminiError.debugMessage
            });

            throw new GeminiRequestError({
                ...geminiError,
                cause: error
            });
        }
    }

    throw new GeminiRequestError({
        message: "Gemini stayed rate limited after retries",
        userMessage: "Gemini dang ban qua muc cho phep. Ban thu lai sau it phut nhe.",
        debugMessage: `Gemini remained rate limited after ${maxRetries} attempts.`,
        status: 429,
        code: "GEMINI_RATE_LIMITED",
        model: DEFAULT_GEMINI_MODEL,
        retryable: true
    });
}

export default askGemini;
