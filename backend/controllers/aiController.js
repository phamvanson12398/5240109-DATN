
import { getEnvironmentStatus } from "../config/loadEnv.js";
import { askChatbot } from "../services/chatService.js";

const conversationHistory = new Map();

const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_MESSAGES = 20;
const MAX_SESSIONS = 1000;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

const createSession = () => ({
    history: [],
    updatedAt: Date.now()
});

const isExpired = (session, now = Date.now()) =>
    !session?.updatedAt || now - session.updatedAt > SESSION_TTL_MS;

const getSession = (sessionId) => {
    const existing = conversationHistory.get(sessionId);

    if (!existing || isExpired(existing)) {
        if (existing) {
            conversationHistory.delete(sessionId);
            console.log(`[AI Chat] expired session ${sessionId}`);
        }

        const session = createSession();
        conversationHistory.set(sessionId, session);
        console.log(`[AI Chat] new session ${sessionId}`);
        return session;
    }

    return existing;
};

const trimHistory = (history) => {
    if (history.length > MAX_MESSAGES) {
        history.splice(0, history.length - MAX_MESSAGES);
    }
};

const cleanupSessions = () => {
    const now = Date.now();
    let expiredCount = 0;

    for (const [sessionId, session] of conversationHistory.entries()) {
        if (isExpired(session, now)) {
            conversationHistory.delete(sessionId);
            expiredCount += 1;
        }
    }

    if (conversationHistory.size > MAX_SESSIONS) {
        const overflowCount = conversationHistory.size - MAX_SESSIONS;
        const oldestSessions = Array.from(conversationHistory.entries())
            .sort(([, a], [, b]) => a.updatedAt - b.updatedAt)
            .slice(0, overflowCount);

        oldestSessions.forEach(([sessionId]) => conversationHistory.delete(sessionId));

        if (oldestSessions.length > 0) {
            console.log(`[AI Chat] cleaned ${oldestSessions.length} overflow sessions`);
        }
    }

    if (expiredCount > 0) {
        console.log(`[AI Chat] cleaned ${expiredCount} expired sessions`);
    }
};
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
        const { message, sessionId, userName } = req.body;
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

        const session = getSession(sessionId);
        const history = session.history || [];

        console.log(`[AI Chat] session=${sessionId}, history=${history.length}`);

        const reply = await askChatbot(message, history, {
            userName
        });

        history.push({ role: "user", content: message });
        history.push({ role: "assistant", content: reply });

        trimHistory(history);
        session.history = history;
        session.updatedAt = Date.now();

        conversationHistory.set(sessionId, session);

        return res.json({
            success: true,
            data: reply,
            sessionId,
            historyLength: session.history.length,
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
            "Xin lỗi, mình đang gặp lỗi khi xử lý. Bạn thử lại sau vài giây nhé!";

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
    cleanupSessions();
    const envStatus = getEnvironmentStatus();

    return res.json({
        success: true,
        totalSessions: conversationHistory.size,
        sessionTtlMs: SESSION_TTL_MS,
        env: {
            source: envStatus.source,
            loadedAt: envStatus.loadedAt,
            stale: envStatus.stale,
            loadedFingerprint: envStatus.loadedFingerprint,
            currentFingerprint: envStatus.currentFingerprint
        },
        sessions: Array.from(conversationHistory.entries()).map(([id, sesion]) => ({
            sessionId: id,
            messageCount: session.history.length,
            updatedAt: new Date(session.updatedAt).toISOString()
        }))
    });
};

setInterval(cleanupSessions, CLEANUP_INTERVAL_MS);
