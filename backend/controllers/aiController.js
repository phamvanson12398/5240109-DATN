
import { getEnvironmentStatus } from "../config/loadEnv.js";
import { askChatbot } from "../services/chatService.js";

const conversationHistory = new Map();

const buildDebugPayload = (error = {}, envStatus = getEnvironmentStatus()) => ({
    name: error?.name || "Error",
    code: error?.code || "UNKNOWN_ERROR",
    status: error?.status || 500,
    message: error?.debugMessage || error?.message || "Unknown error",
    model: error?.model || null,
    retryable: Boolean(error?.retryable),
    env: {
        source: envStatus.source,
        loadedAt: envStatus.loadedAt,
        stale: envStatus.stale,
        missing: envStatus.missing,
        loadedFingerprint: envStatus.loadedFingerprint,
        currentFingerprint: envStatus.currentFingerprint
    }
});

const respondConfigReloadRequired = (res, envStatus) => {
    const debug = {
        reason: "config.env changed after the current server process started",
        env: {
            source: envStatus.source,
            loadedAt: envStatus.loadedAt,
            loadedFingerprint: envStatus.loadedFingerprint,
            currentFingerprint: envStatus.currentFingerprint
        }
    };

    console.warn("[AI Chat] config.env changed after startup. Restart backend to load the new values.", debug);

    return res.status(503).json({
        success: false,
        error: "CONFIG_RELOAD_REQUIRED",
        userMessage: "Backend dang chay cau hinh cu. Hay restart server de nap config.env moi.",
        debug
    });
};

export const chat = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const envStatus = getEnvironmentStatus();

        if (envStatus.stale) {
            return respondConfigReloadRequired(res, envStatus);
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                error: "message is required"
            });
        }

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: "sessionId is required"
            });
        }

        let history = conversationHistory.get(sessionId);

        if (!history) {
            history = [];
            conversationHistory.set(sessionId, history);
            console.log(`[AI Chat] new session ${sessionId}`);
        }

        console.log(`[AI Chat] session=${sessionId}, history=${history.length}`);

        const reply = await askChatbot(message, history);

        history.push({ role: "user", content: message });
        history.push({ role: "assistant", content: reply });

        const MAX_MESSAGES = 20;
        if (history.length > MAX_MESSAGES) {
            history.splice(0, history.length - MAX_MESSAGES);
        }

        conversationHistory.set(sessionId, history);

        return res.json({
            success: true,
            data: reply,
            sessionId,
            historyLength: history.length,
            env: {
                loadedAt: envStatus.loadedAt,
                loadedFingerprint: envStatus.loadedFingerprint
            }
        });
    } catch (error) {
        const envStatus = getEnvironmentStatus();
        const debug = buildDebugPayload(error, envStatus);
        const userMessage =
            error?.userMessage ||
            "Xin loi, minh dang gap loi khi xu ly. Ban thu lai sau vai giay nhe!";

        console.error("[AI Chat] request failed", debug);

        return res.status(error?.status || 500).json({
            success: false,
            error: debug.code,
            userMessage,
            debug
        });
    }
};

export const clearHistory = (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: "sessionId is required"
            });
        }

        if (conversationHistory.has(sessionId)) {
            conversationHistory.delete(sessionId);
            console.log(`[AI Chat] cleared session ${sessionId}`);
            return res.json({ success: true, message: "History cleared successfully" });
        }

        console.log(`[AI Chat] clear requested for missing session ${sessionId}`);
        return res.json({
            success: true,
            message: "History already cleared",
            alreadyCleared: true
        });
    } catch (error) {
        console.error("[AI Chat] clear history failed", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const getStats = (req, res) => {
    const envStatus = getEnvironmentStatus();

    return res.json({
        success: true,
        totalSessions: conversationHistory.size,
        env: {
            source: envStatus.source,
            loadedAt: envStatus.loadedAt,
            stale: envStatus.stale,
            loadedFingerprint: envStatus.loadedFingerprint,
            currentFingerprint: envStatus.currentFingerprint
        },
        sessions: Array.from(conversationHistory.entries()).map(([id, history]) => ({
            sessionId: id,
            messageCount: history.length
        }))
    });
};

setInterval(() => {
    const MAX_SESSIONS = 1000;

    if (conversationHistory.size > MAX_SESSIONS) {
        const oldestSessions = Array.from(conversationHistory.keys()).slice(0, 100);
        oldestSessions.forEach((id) => conversationHistory.delete(id));
        console.log(`[AI Chat] cleaned ${oldestSessions.length} old sessions`);
    }
}, 60 * 60 * 1000);
