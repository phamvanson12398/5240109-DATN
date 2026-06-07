import React, { useEffect, useRef, useState } from "react";
import axios from "@/shared/api/http.js";
import { useDispatch, useSelector } from "react-redux";
import { addItemsToCart } from "@/features/cart/cartSlice";
import ReactMarkdown from "react-markdown";

const CHAT_HISTORY_KEY = "user_chat_history";
const CHAT_SESSION_KEY = "user_session_id";

const createSessionId = () =>
    `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const getStoredMessages = () => {
    try {
        const saved = sessionStorage.getItem(CHAT_HISTORY_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const getStoredSessionId = () => {
    const saved = sessionStorage.getItem(CHAT_SESSION_KEY);
    if (saved) return saved;

    const nextSessionId = createSessionId();
    sessionStorage.setItem(CHAT_SESSION_KEY, nextSessionId);
    return nextSessionId;
};

const getMessageTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const normalizeInternalHref = (href) => {
    if (!href || typeof href !== "string") return null;

    try {
        const url = new URL(href, window.location.origin);
        const isSameOrigin = url.origin === window.location.origin;
        const isAllowedPath = /^\/product\/[^/?#]+\/?$/.test(url.pathname) ||
            /^\/cart\/add\/[^/?#]+\/?$/.test(url.pathname);

        if (!isSameOrigin || !isAllowedPath) return null;

        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return null;
    }
};

const getCartProductId = (href) => {
    const safeHref = normalizeInternalHref(href);
    if (!safeHref || !safeHref.startsWith("/cart/add/")) return null;

    const [, , , productId] = safeHref.split("/");
    return productId || null;
};

const AIChatBubble = () => {
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const { user } = useSelector((state) => state.user);

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(getStoredMessages);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(getStoredSessionId);

    const userName = user?.name ? user.name.split(" ").pop() : "bạn";

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    role: "bot",
                    content: `Chào ${userName}! 📚 Mình là trợ lý sách của bạn. Hôm nay bạn đang tìm thể loại sách nào, muốn khám phá đầu sách mới hay cần gợi ý sách phù hợp với sở thích của mình?`,
                    time: getMessageTime()
                }
            ]);
        }
    }, [userName, messages.length]);

    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const resetLocalChat = () => {
        const nextSessionId = createSessionId();

        sessionStorage.removeItem(CHAT_HISTORY_KEY);
        sessionStorage.setItem(CHAT_SESSION_KEY, nextSessionId);
        setSessionId(nextSessionId);
        setMessages([]);
        setInput("");
        setLoading(false);
    };

    const clearChat = async () => {
        if (!window.confirm("Bạn có muốn xóa toàn bộ lịch sử trò chuyện với Góc Sách không?")) {
            return;
        }

        try {
            await axios.post("/api/v1/ai/chat/clear", { sessionId });
        } catch (error) {
            console.error("[AI Chat] Không thể xóa lịch sử trên backend", error);
        } finally {
            resetLocalChat();
        }
    };

    const handleSendMessage = async (event, customInput) => {
        if (event) event.preventDefault();

        const messageText = customInput || input;
        if (!messageText.trim() || loading) return;

        const userMessage = {
            role: "user",
            content: messageText.trim(),
            time: getMessageTime()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await axios.post("/api/v1/ai/chat", {
                message: userMessage.content,
                sessionId,
                userName
            });

            const botMessage = {
                role: "bot",
                content: response.data.data || "Xin lỗi, hiện tại mình đang gặp chút vấn đề kỹ thuật.",
                time: getMessageTime()
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error(error);

            const errorMessage = {
                role: "bot",
                content: error?.response?.data?.userMessage || "Hệ thống đang gặp lỗi, bạn thử lại sau nhé!",
                time: getMessageTime()
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const styles = `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .tobi-coral-gradient {
            background: linear-gradient(45deg, #ae2f34, #ff6b6b);
        }
        .tobi-wine-gradient {
            background: linear-gradient(135deg, #561922, #722f37);
        }
        .tobi-glass-panel {
            background: rgba(255, 255, 255, 0.72);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        .tobi-markdown h1,
        .tobi-markdown h2 {
            font-size: 1.05rem;
            margin: 8px 0 4px;
            color: #561922;
            font-weight: 800;
        }
        .tobi-markdown img {
            max-width: 100%;
            border-radius: 12px;
            margin: 12px 0;
            border: 1px solid rgba(0,0,0,0.08);
        }
        .tobi-markdown a {
            display: inline-block;
            margin: 4px 2px;
            padding: 6px 12px;
            background: #fff;
            color: #ae2f34;
            border: 1px solid #ae2f34;
            border-radius: 9999px;
            font-weight: 700;
            text-decoration: none;
            font-size: 12px;
        }
        .tobi-markdown a:hover {
            background: #ae2f34;
            color: #fff;
        }
        .tobi-markdown p {
            margin-bottom: 10px;
            line-height: 1.55;
        }
        .tobi-markdown p:last-child {
            margin-bottom: 0;
        }
        .tobi-markdown ul,
        .tobi-markdown ol {
            margin-left: 1.2rem;
            margin-bottom: 8px;
        }
    `;

    return (
        <>
            <style>{styles}</style>

            <div className="fixed bottom-4 right-3 z-50 flex flex-col items-end gap-4 font-sans sm:bottom-8 sm:right-8">
                {isOpen && (
                    <div className="tobi-glass-panel flex h-[min(620px,calc(100vh-96px))] w-[calc(100vw-24px)] max-w-[400px] flex-col overflow-hidden rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] ring-1 ring-white/20">
                        <div className="tobi-wine-gradient flex items-center justify-between p-5">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-stone-100">
                                        <span
                                            className="material-symbols-outlined text-[28px] text-[#561922]"
                                            style={{ fontVariationSettings: "'FILL' 1" }}
                                        >
                                            person_4
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#561922] bg-emerald-400" />
                                </div>

                                <div>
                                    <h3 className="m-0 font-serif text-lg font-bold uppercase tracking-widest text-white">
                                        Góc Sách
                                    </h3>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={clearChat}
                                    title="Xóa lịch sử"
                                    className="flex cursor-pointer items-center border-0 bg-transparent p-1 text-white/60 transition-colors hover:text-white"
                                >
                                    <span className="material-symbols-outlined text-2xl">delete</span>
                                </button>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    title="Thu nhỏ"
                                    className="flex cursor-pointer items-center border-0 bg-transparent p-1 text-white/60 transition-colors hover:text-white"
                                >
                                    <span className="material-symbols-outlined text-2xl">remove</span>
                                </button>
                            </div>
                        </div>

                        <div className="relative flex flex-grow flex-col gap-4 overflow-y-auto p-4">
                            <div className="my-2 flex justify-center">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                                    Trò chuyện cùng Góc Sách
                                </span>
                            </div>

                            {messages.map((message, index) => (
                                <div
                                    key={`${message.role}-${index}`}
                                    className={`flex max-w-[90%] flex-col gap-1 ${message.role === "bot" ? "" : "self-end items-end"}`}
                                >
                                    <div
                                        className={`tobi-markdown rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${message.role === "bot"
                                                ? "rounded-tl-none bg-white/85 text-[#211a1a]"
                                                : "rounded-tr-none bg-[#561922] text-white"
                                            }`}
                                    >
                                        <ReactMarkdown
                                            components={{
                                                a: ({ href, children }) => {
                                                    const productId = getCartProductId(href);

                                                    if (productId) {
                                                        return (
                                                            <button
                                                                onClick={(event) => {
                                                                    event.preventDefault();
                                                                    dispatch(addItemsToCart({ id: productId, quantity: 1 }));
                                                                    // window.alert("Đã thêm vào giỏ hàng thành công!");
                                                                }}
                                                                className="my-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#ae2f34] p-3 text-[13px] font-extrabold uppercase tracking-wide text-white shadow-lg transition-all hover:bg-[#561922]"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">
                                                                    add_shopping_cart
                                                                </span>
                                                                Thêm vào giỏ hàng
                                                            </button>
                                                        );
                                                    }

                                                    const safeHref = normalizeInternalHref(href);
                                                    if (!safeHref) {
                                                        return <span>{children}</span>;
                                                    }

                                                    return <a href={safeHref}>{children}</a>;
                                                }
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>

                                    <span className="px-1 text-[9px] text-stone-400">{message.time}</span>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex max-w-[85%] flex-col gap-1">
                                    <div className="flex h-[52px] items-center gap-2 rounded-2xl rounded-tl-none bg-white/85 p-4 text-sm text-[#211a1a] shadow-sm">
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400" />
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:0.2s]" />
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {messages.length <= 2 && !loading && (
                            <div className="flex flex-wrap gap-2 px-4 pb-3">
                                <button
                                    onClick={() => handleSendMessage(null, "Gợi ý cho mình vài cuốn sách hay nên đọc")}
                                    className="cursor-pointer rounded-full border border-[#ae2f34]/20 bg-white/70 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#ae2f34] transition-all hover:bg-[#ae2f34] hover:text-white"
                                >
                                    Sách hay
                                </button>

                                <button
                                    onClick={() => handleSendMessage(null, "Gợi ý sách phát triển bản thân")}
                                    className="cursor-pointer rounded-full border border-stone-200 bg-white/70 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-600 transition-all hover:bg-stone-100"
                                >
                                    Kỹ năng sống
                                </button>

                                <button
                                    onClick={() => handleSendMessage(null, "Gợi ý sách đang giảm giá")}
                                    className="cursor-pointer rounded-full border border-stone-200 bg-white/70 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-600 transition-all hover:bg-stone-100"
                                >
                                    Sách sale
                                </button>
                            </div>
                        )}

                        <div className="border-t border-white/20 bg-white/45 p-4 backdrop-blur-md">
                            <form onSubmit={handleSendMessage} className="relative m-0 flex items-center">
                                <input
                                    className="w-full rounded-full border-0 bg-white py-4 pl-6 pr-14 text-sm text-[#211a1a] shadow-inner outline-none focus:ring-2 focus:ring-[#ae2f34]/20"
                                    placeholder="Hỏi Góc Sách về sách bạn nên đọc..."
                                    type="text"
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    disabled={loading}
                                />

                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="tobi-coral-gradient absolute right-1.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 text-white shadow-lg transition-transform hover:scale-95 active:scale-90 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="tobi-coral-gradient relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-0 shadow-[0_10px_30px_rgba(174,47,52,0.4)] transition-transform hover:scale-110 active:scale-90"
                    >
                        <span
                            className="material-symbols-outlined text-3xl text-white"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            chat_bubble
                        </span>

                        {messages.length === 1 && (
                            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#fff8f7] bg-[#561922]">
                                <span className="m-0 text-[10px] font-bold text-white">1</span>
                            </div>
                        )}
                    </button>
                )}
            </div>
        </>
    );
};

export default AIChatBubble;
