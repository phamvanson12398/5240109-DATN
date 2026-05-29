
import React, { useState, useEffect, useRef } from 'react';
import axios from '@/shared/api/http.js';
import { useSelector, useDispatch } from 'react-redux';
import { addItemsToCart } from '@/features/cart/cartSlice';
import ReactMarkdown from 'react-markdown';

const AIChatBubble = () => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);

    // Load messages from sessionStorage (resets on new tab/visit)
    const [messages, setMessages] = useState(() => {
        const saved = sessionStorage.getItem('tobi_chat_history');
        return saved ? JSON.parse(saved) : [];
    });

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Always generate a fresh sessionId per browser session (tab)
    const [sessionId] = useState(() => {
        const saved = sessionStorage.getItem('tobi_session_id');
        if (saved) return saved;
        const newId = `tobi_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        sessionStorage.setItem('tobi_session_id', newId);
        return newId;
    });
    const messagesEndRef = useRef(null);

    // Get user from Redux to personalize Tobi's greeting
    const { user } = useSelector(state => state.user);
    const userName = user ? (user.name.split(' ').pop()) : 'bạn';

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    role: "bot",
                    content: `Chào ${userName}! 📚✨ Mình là trợ lý tư vấn sách của bạn. Hôm nay bạn đang tìm sách cho bản thân, làm quà tặng hay muốn mình gợi ý theo sở thích và chủ đề nào không? 😊`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }
    }, [userName, messages.length]);

    // Save messages to sessionStorage (cleared on tab close / new visit)
    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem('tobi_chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const clearChat = () => {
        if (window.confirm("Bạn có muốn xóa toàn bộ lịch sử trò chuyện với Tobi không?")) {
            sessionStorage.removeItem('tobi_chat_history');
            sessionStorage.removeItem('tobi_session_id');
            setMessages([]);
        }
    };

    const handleSendMessage = async (e, customInput) => {
        if (e) e.preventDefault();
        const messageText = customInput || input;
        if (!messageText.trim() || loading) return;

        const userMessage = {
            role: "user",
            content: messageText.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('/api/v1/ai/chat', {
                message: userMessage.content,
                sessionId: sessionId,
                userName: userName // Pass user name for personalization
            });

            const botMessage = {
                role: "bot",
                content: response.data.data || "Xin lỗi, hiện tại tôi đang gặp chút vấn đề kỹ thuật.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = {
                role: "bot",
                content: "Tobi đang nghỉ ngơi, vui lòng thử lại sau nhé!",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const styles = `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .coral-gradient {
            background: linear-gradient(45deg, #ae2f34, #ff6b6b);
        }
        .wine-gradient {
            background: linear-gradient(135deg, #561922, #722f37);
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        /* Markdown Specific Styles */
        .markdown-body h1, .markdown-body h2 {
            font-size: 1.1rem;
            margin-top: 8px;
            margin-bottom: 4px;
            color: #561922;
            font-weight: 800;
        }
        .markdown-body img {
            max-width: 100%;
            border-radius: 16px;
            margin: 12px 0;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            border: 1px solid rgba(0,0,0,0.05);
        }
        .markdown-body a {
            display: inline-block;
            margin: 4px 2px;
            padding: 8px 16px;
            background: #fff;
            color: #ae2f34;
            border: 1.5px solid #ae2f34;
            border-radius: 9999px;
            font-weight: 700;
            text-decoration: none;
            font-size: 12px;
            transition: all 0.2s ease;
        }
        .markdown-body a:hover {
            background: #ae2f34;
            color: #fff;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(174,47,52,0.2);
        }
        /* Specific style for "Add to Cart" link pattern */
        .markdown-body a[href*="cart/add"] {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            margin: 12px 0;
            padding: 12px;
            background: #ae2f34;
            color: #fff !important;
            border: none;
            border-radius: 12px;
            font-weight: 800;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(174,47,52,0.3);
        }
        .markdown-body a[href*="cart/add"]:hover {
            background: #561922;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(174,47,52,0.4);
        }
        .markdown-body a[href*="/product/"] {
            color: #ae2f34;
            font-weight: 600;
            text-decoration: underline;
            background: transparent;
            border: none;
            padding: 0;
            margin: 0 4px;
        }
        .markdown-body p {
            margin-bottom: 12px;
            line-height: 1.6;
        }
        .markdown-body p:last-child {
            margin-bottom: 0;
        }
        .markdown-body ul, .markdown-body ol {
            margin-left: 1.2rem;
            margin-bottom: 8px;
        }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-6 font-sans">
                {isOpen && (
                    <div className="glass-panel w-[400px] h-[620px] rounded-3xl overflow-hidden flex flex-col shadow-[0_20px_40px_rgba(0,0,0,0.15)] ring-1 ring-white/20">
                        {/* Header */}
                        <div className="wine-gradient p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-stone-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#561922] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_4</span>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#561922] rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="text-white font-serif text-lg font-bold m-0 uppercase tracking-widest">Góc Sách</h3>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={clearChat} title="Xóa lịch sử" className="text-white/60 hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-1 flex items-center">
                                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
                                </button>
                                <button onClick={() => setIsOpen(false)} title="Thu nhỏ" className="text-white/60 hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-1 flex items-center">
                                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>remove</span>
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 relative">
                            <div className="flex justify-center my-2">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">Trò chuyện cùng Góc Sách</span>
                            </div>

                            {messages.map((msg, index) => (
                                <div key={index} className={`flex flex-col gap-1 ${msg.role === "bot" ? "max-w-[90%]" : "items-end self-end max-w-[90%]"}`}>
                                    <div className={`${msg.role === "bot" ? "bg-white/80 backdrop-blur-md rounded-tl-none text-[#211a1a]" : "bg-[#561922] text-white rounded-tr-none"} p-4 rounded-2xl shadow-sm text-sm leading-relaxed markdown-body`}>
                                        <ReactMarkdown
                                            components={{
                                                a: (props) => {
                                                    // Intercept Add to Cart links
                                                    if (props.href && props.href.includes('cart/add/')) {
                                                        const parts = props.href.split('/');
                                                        const productId = parts[parts.length - 1];

                                                        return (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    dispatch(addItemsToCart({ id: productId, quantity: 1 }));
                                                                    alert("Đã thêm vào giỏ hàng thành công! ✨");
                                                                }}
                                                                className="flex items-center justify-center gap-2 w-full mt-3 mb-3 p-3 bg-[#ae2f34] text-white border-0 rounded-xl font-extrabold text-[13px] uppercase tracking-wider shadow-lg hover:bg-[#561922] transition-all cursor-pointer"
                                                                style={{ textDecoration: 'none' }}
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                                                                THÊM VÀO GIỎ HÀNG
                                                            </button>
                                                        );
                                                    }
                                                    return <a {...props} />;
                                                }
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                    <span className="text-[9px] text-stone-400 px-1">{msg.time}</span>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex flex-col gap-1 max-w-[85%]">
                                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-[#211a1a] flex items-center gap-2 h-[52px]">
                                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Suggestions */}
                        {messages.length <= 2 && !loading && (
                            <div className="flex flex-wrap gap-2 px-4 pb-3">
                                <button
                                    onClick={() => handleSendMessage(null, 'Gợi ý cho mình vài cuốn sách phát triển bản thân hay')}
                                    className="px-4 py-2 rounded-full border border-[#ae2f34]/20 bg-white/60 text-[#ae2f34] text-[10px] font-bold uppercase tracking-widest hover:bg-[#ae2f34] hover:text-white transition-all cursor-pointer"
                                >
                                    Self-help 📘
                                </button>

                                <button
                                    onClick={() => handleSendMessage(null, 'Mình muốn tìm tiểu thuyết đáng đọc')}
                                    className="px-4 py-2 rounded-full border border-stone-200 bg-white/60 text-stone-500 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-100 transition-all cursor-pointer"
                                >
                                    Tiểu Thuyết 📖
                                </button>

                                <button
                                    onClick={() => handleSendMessage(null, 'Cho mình xem sách đang giảm giá')}
                                    className="px-4 py-2 rounded-full border border-stone-200 bg-white/60 text-stone-500 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-100 transition-all cursor-pointer"
                                >
                                    Sách Sale 🏷️
                                </button>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-white/40 border-t border-white/20 backdrop-blur-md">
                            <form onSubmit={handleSendMessage} className="relative flex items-center m-0">
                                <input
                                    className="w-full bg-white border-0 outline-none rounded-full py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-[#ae2f34]/20 shadow-inner text-[#211a1a]"
                                    placeholder="Hỏi để tìm những cuốn sách hay dành riêng cho bạn... 📚✨"
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={loading}
                                />
                                <button type="submit" disabled={!input.trim() || loading} className="absolute right-1.5 w-11 h-11 coral-gradient text-white rounded-full flex items-center justify-center hover:scale-95 transition-transform active:scale-90 shadow-lg disabled:opacity-50 border-0 cursor-pointer">
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* FAB */}
                {!isOpen && (
                    <button onClick={() => setIsOpen(true)} className="coral-gradient w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(174,47,52,0.4)] hover:scale-110 transition-transform active:scale-90 relative border-0 cursor-pointer">
                        <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                        {messages.length === 1 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#561922] border-2 border-[#fff8f7] rounded-full flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold m-0">1</span>
                            </div>
                        )}
                    </button>
                )}
            </div>
        </>
    );
};

export default AIChatBubble;
