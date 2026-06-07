const MAX_PRODUCTS = 6;

const BOOK_GENRE_ALIASES = {
    van_hoc: [
        "văn học",
        "tiểu thuyết",
        "truyện",
        "novel",
        "fiction"
    ],

    kinh_te: [
        "kinh tế",
        "kinh doanh",
        "business",
        "marketing",
        "đầu tư",
        "dau tu"
    ],

    tam_ly: [
        "tâm lý",
        "tam ly",
        "self help",
        "phát triển bản thân",
        "phat trien ban than"
    ],

    khoa_hoc: [
        "khoa học",
        "khoa hoc",
        "science",
        "nghiên cứu",
        "nghien cuu"
    ],

    lich_su: [
        "lịch sử",
        "lich su",
        "history"
    ],

    thieu_nhi: [
        "thiếu nhi",
        "thieu nhi",
        "trẻ em",
        "tre em",
        "children"
    ],

    ngoai_ngu: [
        "ngoại ngữ",
        "ngoai ngu",
        "english",
        "ielts",
        "toeic"
    ],

    ky_nang_song: [
        "kỹ năng sống",
        "ky nang song",
        "giao tiếp",
        "giao tiep",
        "lãnh đạo",
        "lanh dao"
    ],

    truyen_tranh: [
        "truyện tranh",
        "truyen tranh",
        "manga",
        "comic"
    ],

    cong_nghe: [
        "công nghệ",
        "cong nghe",
        "lập trình",
        "lap trinh",
        "it",
        "ai"
    ]
};

const normalizeText = (value = "") =>
    String(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .trim();

const includesAny = (text, keywords) =>
    keywords.some((keyword) => text.includes(normalizeText(keyword)));

const productText = (product) =>
    normalizeText([
        product.name,
        product.author,
        product.publisher,
        product.description,
        product.keyword,
        product.language,
        product.category?.level1,
        product.category?.level2
    ].filter(Boolean).join(" "));

const applyStrictFilter = (current, predicate, state) => {
    state.hasSpecificIntent = true;
    return current.filter(predicate);
};

const genreTokensFor = (genreName) => {
    const normalizedGenre = normalizeText(genreName);
    return BOOK_GENRE_ALIASES[normalizedGenre] || [genreName];
};

const detectRequestedGenre = (message) => {
    const normalizedMessage = normalizeText(message);

    for (const [genre, aliases] of Object.entries(BOOK_GENRE_ALIASES)) {
        if (includesAny(normalizedMessage, aliases)) {
            return genre;
        }
    }

    const explicitGenreMatch = normalizedMessage.match(
        /(?:the loai|loai sach|sach|genre)\s+([a-z0-9\s-]{2,50})/i
    );

    return explicitGenreMatch?.[1]?.trim() || null;
};
const parseBudget = (message) => {
    const raw = String(message || "").toLowerCase();
    const normalized = normalizeText(raw);

    const kMatch =
        raw.match(/(dưới|duoi|tối đa|toi da|<=|<)?\s*(\d+)\s*(k|nghìn|ngàn|nghin|ngan)/i) ||
        normalized.match(/(duoi|toi da|<=|<)?\s*(\d+)\s*(k|nghin|ngan)/i);

    if (kMatch) {
        return {
            value: Number.parseInt(kMatch[2], 10) * 1000,
            mode: kMatch[1] ? "lte" : "around"
        };
    }

    const millionMatch =
        raw.match(/(dưới|duoi|tối đa|toi da|<=|<)?\s*(\d+)\s*(triệu|tr|trieu)/i) ||
        normalized.match(/(duoi|toi da|<=|<)?\s*(\d+)\s*(trieu|tr)/i);

    if (millionMatch) {
        return {
            value: Number.parseInt(millionMatch[2], 10) * 1000000,
            mode: millionMatch[1] ? "lte" : "around"
        };
    }

    return null;
};

const sortByPriority = (products) =>
    [...products].sort((a, b) => {
        const aSale = Number(a.originalPrice || 0) > Number(a.price || 0) ? 1 : 0;
        const bSale = Number(b.originalPrice || 0) > Number(b.price || 0) ? 1 : 0;

        const aStock = Number(a.stock || 0) > 0 ? 1 : 0;
        const bStock = Number(b.stock || 0) > 0 ? 1 : 0;

        return (
            bStock - aStock ||
            bSale - aSale ||
            Number(b.sold || 0) - Number(a.sold || 0) ||
            Number(b.ratings || 0) - Number(a.ratings || 0)
        );
    });

const filterByRequestedGenre = (products, requestedGenre) => {
    if (!requestedGenre) return products;

    const tokens = genreTokensFor(requestedGenre).map(normalizeText);

    return products.filter((product) =>
        tokens.some((token) => productText(product).includes(token))
    );
};

export function filterRelevantProducts(products = [], userMessage = "") {
    if (!Array.isArray(products) || products.length === 0) {
        return [];
    }

    const msg = normalizeText(userMessage);
    let filtered = [...products];
    const state = { hasSpecificIntent: false };

    const requestedGenre = detectRequestedGenre(userMessage);

    if (requestedGenre) {
        state.hasSpecificIntent = true;
        filtered = filterByRequestedGenre(filtered, requestedGenre);
    }

    const bookTypeKeywords = [
        "sách",
        "truyện",
        "tiểu thuyết",
        "truyện tranh",
        "manga",
        "comic",
        "giáo trình",
        "sách thiếu nhi",
        "sách kinh tế",
        "sách kỹ năng",
        "sách ngoại ngữ",
        "sách lịch sử",
        "sách khoa học",
        "sách lập trình"
    ];

    for (const type of bookTypeKeywords) {
        const normalizedType = normalizeText(type);

        if (msg.includes(normalizedType)) {
            filtered = applyStrictFilter(
                filtered,
                (product) => productText(product).includes(normalizedType),
                state
            );
            break;
        }
    }

    const authorKeywords = [
        "nguyễn nhật ánh",
        "nam cao",
        "tô hoài",
        "vũ trọng phụng",
        "ngô tất tố",
        "haruki murakami",
        "osamu dazai",
        "dale carnegie",
        "paulo coelho",
        "j.k. rowling"
    ];

    for (const author of authorKeywords) {
        const normalizedAuthor = normalizeText(author);

        if (msg.includes(normalizedAuthor)) {
            filtered = applyStrictFilter(
                filtered,
                (product) =>
                    normalizeText(product.author).includes(normalizedAuthor) ||
                    productText(product).includes(normalizedAuthor),
                state
            );
            break;
        }
    }

    const publisherKeywords = [
        "kim đồng",
        "nxb trẻ",
        "nhã nam",
        "alphabooks",
        "first news",
        "đinh tị",
        "mcbooks",
        "thaihabooks"
    ];

    for (const publisher of publisherKeywords) {
        const normalizedPublisher = normalizeText(publisher);

        if (msg.includes(normalizedPublisher)) {
            filtered = applyStrictFilter(
                filtered,
                (product) =>
                    normalizeText(product.publisher).includes(normalizedPublisher) ||
                    productText(product).includes(normalizedPublisher),
                state
            );
            break;
        }
    }

    const languageKeywords = {
        "Tiếng Việt": ["tiếng việt", "tieng viet", "sách việt"],
        English: ["english", "tiếng anh", "tieng anh", "sách tiếng anh"],
        Japanese: ["japanese", "tiếng nhật", "tieng nhat"],
        Chinese: ["chinese", "tiếng trung", "tieng trung"]
    };

    for (const [language, keywords] of Object.entries(languageKeywords)) {
        if (includesAny(msg, keywords)) {
            filtered = applyStrictFilter(
                filtered,
                (product) =>
                    normalizeText(product.language).includes(normalizeText(language)) ||
                    productText(product).includes(normalizeText(language)),
                state
            );
            break;
        }
    }

    const budget = parseBudget(userMessage);

    if (budget) {
        filtered = applyStrictFilter(
            filtered,
            (product) => {
                const price = Number(product.price || 0);

                if (budget.mode === "lte") {
                    return price <= budget.value;
                }

                return price >= budget.value * 0.6 && price <= budget.value * 1.4;
            },
            state
        );
    }

    if (includesAny(msg, ["sale", "giảm giá", "giam gia", "khuyến mãi", "khuyen mai", "ưu đãi", "uu dai"])) {
        state.hasSpecificIntent = true;

        filtered = filtered.filter(
            (product) => Number(product.originalPrice || 0) > Number(product.price || 0)
        );
    }

    if (includesAny(msg, ["bán chạy", "ban chay", "best seller", "bestseller", "hot", "nổi bật", "noi bat"])) {
        state.hasSpecificIntent = true;
        filtered = sortByPriority(filtered);
    }

    const inStock = filtered.filter((product) => Number(product.stock || 0) > 0);

    if (inStock.length > 0) {
        filtered = inStock;
    }

    if (filtered.length === 0) {
        console.log("Không tìm thấy sách phù hợp với bộ lọc chat.", {
            requestedGenre,
            userMessage
        });

        return [];
    }

    return sortByPriority(filtered).slice(0, MAX_PRODUCTS);
}

export function validateInput(userMessage) {
    if (!userMessage || typeof userMessage !== "string") {
        return {
            valid: false,
            message: "Bạn muốn tìm sách gì ạ?"
        };
    }

    const trimmed = userMessage.trim();

    if (trimmed.length === 0) {
        return {
            valid: false,
            message: "Bạn muốn tìm sách gì ạ?"
        };
    }

    if (trimmed.length > 500) {
        return {
            valid: false,
            message: "Câu hỏi hơi dài quá bạn ơi. Bạn có thể nói ngắn gọn hơn được không?"
        };
    }

    const normalized = normalizeText(trimmed);
    const spamPatterns = /(.)\1{10,}|^[^a-z0-9\s]+$/i;

    if (spamPatterns.test(normalized)) {
        return {
            valid: false,
            message: "Mình chưa hiểu rõ. Bạn có thể nói lại tên sách, thể loại hoặc tác giả bạn muốn tìm không?"
        };
    }

    return { valid: true };
}