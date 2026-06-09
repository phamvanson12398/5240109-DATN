const MAX_BOOKS = 6;

const BOOK_CATEGORY_IDS = {
  SACH_VIET_NAM: "6a196237765954cad1a84ac6",
  FOREIGN_BOOKS: "6a196590765954cad1a84b45",

  TIEU_THUYET_VIET_NAM: "6a196291765954cad1a84ae5",
  VAN_HOC_VIET_NAM: "6a196966765954cad1a84bfb",
  TRUYEN_NGAN_VIET_NAM: "6a26452492f10942f691e81c",
  KINH_TE_KINH_DOANH: "6a26453792f10942f691e824",
  KY_NANG_SONG: "6a26454492f10942f691e82c",
  TAM_LY_HOC: "6a26455a92f10942f691e834",
  GIAO_DUC_NUOI_DAY_CON: "6a26456992f10942f691e83c",
  LICH_SU_VIET_NAM: "6a26457a92f10942f691e844",
  THIEU_NHI_VIET_NAM: "6a26459d92f10942f691e854",
  CHINH_TRI_XA_HOI: "6a26462892f10942f691e874",

  CLASSICS: "6a196a4d765954cad1a84c3b",
  FICTION: "6a196a5e765954cad1a84c43",
  FANTASY: "6a26463892f10942f691e87c",
  MYSTERY_THRILLER: "6a26465692f10942f691e88c",
  SCIENCE_FICTION: "6a26467492f10942f691e89d",
  BUSINESS_ECONOMICS: "6a26468592f10942f691e8a5",
  SELF_HELP: "6a26469692f10942f691e8ad",
  PSYCHOLOGY: "6a2646a492f10942f691e8b5",
  TECHNOLOGY_PROGRAMMING: "6a2646b192f10942f691e8bd",
  LANGUAGE_LEARNING: "6a2646bd92f10942f691e8c5",
};

const BOOK_GENRE_ALIASES = {
  sach_viet_nam: [
    "sách việt nam",
    "sach viet nam",
    "sách việt",
    "sach viet",
  ],

  foreign_books: [
    "foreign books",
    "sách nước ngoài",
    "sach nuoc ngoai",
    "sách ngoại văn",
    "sach ngoai van",
  ],

  tieu_thuyet_viet_nam: [
    "tiểu thuyết việt nam",
    "tieu thuyet viet nam",
    "tiểu thuyết",
    "tieu thuyet",
  ],

  van_hoc_viet_nam: [
    "văn học việt nam",
    "van hoc viet nam",
    "văn học",
    "van hoc",
  ],

  truyen_ngan_viet_nam: [
    "truyện ngắn việt nam",
    "truyen ngan viet nam",
    "truyện ngắn",
    "truyen ngan",
  ],

  kinh_te_kinh_doanh: [
    "kinh tế",
    "kinh te",
    "kinh doanh",
    "business",
    "marketing",
    "đầu tư",
    "dau tu",
    "khởi nghiệp",
    "khoi nghiep",
  ],

  ky_nang_song: [
    "kỹ năng sống",
    "ky nang song",
    "phát triển bản thân",
    "phat trien ban than",
    "giao tiếp",
    "giao tiep",
    "lãnh đạo",
    "lanh dao",
  ],

  tam_ly_hoc: [
    "tâm lý học",
    "tam ly hoc",
    "tâm lý",
    "tam ly",
  ],

  giao_duc_nuoi_day_con: [
    "giáo dục",
    "giao duc",
    "nuôi dạy con",
    "nuoi day con",
    "parenting",
  ],

  lich_su_viet_nam: [
    "lịch sử việt nam",
    "lich su viet nam",
    "lịch sử",
    "lich su",
  ],

  thieu_nhi_viet_nam: [
    "thiếu nhi việt nam",
    "thieu nhi viet nam",
    "thiếu nhi",
    "thieu nhi",
    "trẻ em",
    "tre em",
    "children",
  ],

  chinh_tri_xa_hoi: [
    "chính trị",
    "chinh tri",
    "xã hội",
    "xa hoi",
    "chính trị xã hội",
    "chinh tri xa hoi",
  ],

  classics: [
    "classics",
    "classic",
    "kinh điển",
    "kinh dien",
  ],

  fiction: [
    "fiction",
    "hư cấu",
    "hu cau",
    "tiểu thuyết nước ngoài",
    "tieu thuyet nuoc ngoai",
  ],

  fantasy: [
    "fantasy",
    "kỳ ảo",
    "ky ao",
    "phép thuật",
    "phep thuat",
  ],

  mystery_thriller: [
    "mystery",
    "thriller",
    "mystery thriller",
    "trinh thám",
    "trinh tham",
    "bí ẩn",
    "bi an",
  ],

  science_fiction: [
    "science fiction",
    "sci-fi",
    "scifi",
    "khoa học viễn tưởng",
    "khoa hoc vien tuong",
  ],

  business_economics: [
    "business economics",
    "business",
    "economics",
    "kinh doanh nước ngoài",
    "kinh doanh nuoc ngoai",
  ],

  self_help: [
    "self help",
    "self-help",
    "phát triển bản thân",
    "phat trien ban than",
    "sách truyền cảm hứng",
    "sach truyen cam hung",
  ],

  psychology: [
    "psychology",
    "tâm lý học nước ngoài",
    "tam ly hoc nuoc ngoai",
  ],

  technology_programming: [
    "technology",
    "programming",
    "technology programming",
    "công nghệ",
    "cong nghe",
    "lập trình",
    "lap trinh",
    "javascript",
    "react",
    "nodejs",
    "ai",
  ],

  language_learning: [
    "language learning",
    "học ngoại ngữ",
    "hoc ngoai ngu",
    "ngoại ngữ",
    "ngoai ngu",
    "tiếng anh",
    "tieng anh",
    "english",
    "ielts",
    "toeic",
  ],
};

const BOOK_CATEGORY_MAPPING = {
  sach_viet_nam: {
    level1: BOOK_CATEGORY_IDS.SACH_VIET_NAM,
  },

  foreign_books: {
    level1: BOOK_CATEGORY_IDS.FOREIGN_BOOKS,
  },

  tieu_thuyet_viet_nam: {
    level1: BOOK_CATEGORY_IDS.SACH_VIET_NAM,
    level2: BOOK_CATEGORY_IDS.TIEU_THUYET_VIET_NAM,
  },

  van_hoc_viet_nam: {
    level1: BOOK_CATEGORY_IDS.SACH_VIET_NAM,
    level2: BOOK_CATEGORY_IDS.VAN_HOC_VIET_NAM,
  },

  truyen_ngan_viet_nam: {
    level1: BOOK_CATEGORY_IDS.SACH_VIET_NAM,
    level2: BOOK_CATEGORY_IDS.TRUYEN_NGAN_VIET_NAM,
  },

  kinh_te_kinh_doanh: {
    level1: BOOK_CATEGORY_IDS.SACH_VIET_NAM,
    level2: BOOK_CATEGORY_IDS.KINH_TE_KINH_DOANH,
  },

  ky_nang_song: {
    level1: BOOK_CATEGORY_IDS.SACH_VIET_NAM,
    level2: BOOK_CATEGORY_IDS.KY_NANG_SONG,
  },

  tam_ly_hoc: {
    level1: BOOK_CATEGORY_IDS.SACH_VIET_NAM,
    level2: BOOK_CATEGORY_IDS.TAM_LY_HOC,
  },

  giao_duc_nuoi_day_con: {
    level1: BOOK_CATEGORY_IDS.SACH_VIET_NAM,
    level2: BOOK_CATEGORY_IDS.GIAO_DUC_NUOI_DAY_CON,
  },

  lich_su_viet_nam: {
    level1: BOOK_CATEGORY_IDS.SACH_VIET_NAM,
    level2: BOOK_CATEGORY_IDS.LICH_SU_VIET_NAM,
  },

  thieu_nhi_viet_nam: {
    level1: BOOK_CATEGORY_IDS.SACH_VIET_NAM,
    level2: BOOK_CATEGORY_IDS.THIEU_NHI_VIET_NAM,
  },

  chinh_tri_xa_hoi: {
    level1: BOOK_CATEGORY_IDS.SACH_VIET_NAM,
    level2: BOOK_CATEGORY_IDS.CHINH_TRI_XA_HOI,
  },

  classics: {
    level1: BOOK_CATEGORY_IDS.FOREIGN_BOOKS,
    level2: BOOK_CATEGORY_IDS.CLASSICS,
  },

  fiction: {
    level1: BOOK_CATEGORY_IDS.FOREIGN_BOOKS,
    level2: BOOK_CATEGORY_IDS.FICTION,
  },

  fantasy: {
    level1: BOOK_CATEGORY_IDS.FOREIGN_BOOKS,
    level2: BOOK_CATEGORY_IDS.FANTASY,
  },

  mystery_thriller: {
    level1: BOOK_CATEGORY_IDS.FOREIGN_BOOKS,
    level2: BOOK_CATEGORY_IDS.MYSTERY_THRILLER,
  },

  science_fiction: {
    level1: BOOK_CATEGORY_IDS.FOREIGN_BOOKS,
    level2: BOOK_CATEGORY_IDS.SCIENCE_FICTION,
  },

  business_economics: {
    level1: BOOK_CATEGORY_IDS.FOREIGN_BOOKS,
    level2: BOOK_CATEGORY_IDS.BUSINESS_ECONOMICS,
  },

  self_help: {
    level1: BOOK_CATEGORY_IDS.FOREIGN_BOOKS,
    level2: BOOK_CATEGORY_IDS.SELF_HELP,
  },

  psychology: {
    level1: BOOK_CATEGORY_IDS.FOREIGN_BOOKS,
    level2: BOOK_CATEGORY_IDS.PSYCHOLOGY,
  },

  technology_programming: {
    level1: BOOK_CATEGORY_IDS.FOREIGN_BOOKS,
    level2: BOOK_CATEGORY_IDS.TECHNOLOGY_PROGRAMMING,
  },

  language_learning: {
    level1: BOOK_CATEGORY_IDS.FOREIGN_BOOKS,
    level2: BOOK_CATEGORY_IDS.LANGUAGE_LEARNING,
  },
};

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();

const normalizeId = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id || value.$oid || "");
  }

  return String(value);
};

const includesAny = (text, keywords) =>
  keywords.some((keyword) => text.includes(normalizeText(keyword)));

const getBookLevel1 = (book) =>
  normalizeId(
    book.category?.level1 ||
      book.categoryLevel1 ||
      book.category_level1
  );

const getBookLevel2 = (book) =>
  normalizeId(
    book.category?.level2 ||
      book.categoryLevel2 ||
      book.category_level2
  );

const bookText = (book) =>
  normalizeText(
    [
      book.name,
      book.title,
      book.author,
      book.publisher,
      book.description,
      book.keyword,
      book.language,
      book.sku,
    ]
      .filter(Boolean)
      .join(" ")
  );

const applyStrictFilter = (current, predicate, state) => {
  state.hasSpecificIntent = true;
  return current.filter(predicate);
};

const detectRequestedGenre = (message) => {
  const normalizedMessage = normalizeText(message);

  for (const [genre, aliases] of Object.entries(BOOK_GENRE_ALIASES)) {
    if (includesAny(normalizedMessage, aliases)) {
      return genre;
    }
  }

  return null;
};

const filterByRequestedGenre = (books, requestedGenre) => {
  if (!requestedGenre) return books;

  const category = BOOK_CATEGORY_MAPPING[requestedGenre];

  if (!category) return books;

  return books.filter((book) => {
    const level1 = getBookLevel1(book);
    const level2 = getBookLevel2(book);

    if (category.level2) {
      return level2 === String(category.level2);
    }

    if (category.level1) {
      return level1 === String(category.level1);
    }

    return false;
  });
};

const parseBudget = (message) => {
  const raw = String(message || "").toLowerCase();
  const normalized = normalizeText(raw);

  const kMatch =
    raw.match(
      /(dưới|duoi|tối đa|toi da|không quá|khong qua|<=|<)?\s*(\d+)\s*(k|nghìn|ngàn|nghin|ngan)/i
    ) ||
    normalized.match(
      /(duoi|toi da|khong qua|<=|<)?\s*(\d+)\s*(k|nghin|ngan)/i
    );

  if (kMatch) {
    return {
      value: Number.parseInt(kMatch[2], 10) * 1000,
      mode: kMatch[1] ? "lte" : "around",
    };
  }

  const millionMatch =
    raw.match(
      /(dưới|duoi|tối đa|toi da|không quá|khong qua|<=|<)?\s*(\d+)\s*(triệu|tr|trieu)/i
    ) ||
    normalized.match(
      /(duoi|toi da|khong qua|<=|<)?\s*(\d+)\s*(trieu|tr)/i
    );

  if (millionMatch) {
    return {
      value: Number.parseInt(millionMatch[2], 10) * 1000000,
      mode: millionMatch[1] ? "lte" : "around",
    };
  }

  return null;
};

const sortByPriority = (books) =>
  [...books].sort((a, b) => {
    const aSale = Number(a.originalPrice || 0) > Number(a.price || 0) ? 1 : 0;
    const bSale = Number(b.originalPrice || 0) > Number(b.price || 0) ? 1 : 0;

    const aStock = Number(a.stock || 0) > 0 ? 1 : 0;
    const bStock = Number(b.stock || 0) > 0 ? 1 : 0;

    return (
      bStock - aStock ||
      bSale - aSale ||
      Number(b.sold || 0) - Number(a.sold || 0) ||
      Number(b.ratings || 0) - Number(a.ratings || 0) ||
      Number(b.rating || 0) - Number(a.rating || 0)
    );
  });

const filterByBookName = (books, userMessage, state) => {
  const msg = normalizeText(userMessage);

  const nameMatch =
    msg.match(/(?:sach|cuon|tim sach|ten sach)\s+(.{2,80})/) ||
    msg.match(/"(.{2,80})"/);

  if (!nameMatch) return books;

  const keyword = normalizeText(nameMatch[1]);

  const result = books.filter(
    (book) =>
      normalizeText(book.name).includes(keyword) ||
      normalizeText(book.title).includes(keyword) ||
      bookText(book).includes(keyword)
  );

  if (result.length === 0) return books;

  state.hasSpecificIntent = true;
  return result;
};

export function filterRelevantBooks(books = [], userMessage = "") {
  if (!Array.isArray(books) || books.length === 0) {
    return [];
  }

  const msg = normalizeText(userMessage);
  let filtered = [...books];
  const state = { hasSpecificIntent: false };

  filtered = filterByBookName(filtered, userMessage, state);

  const requestedGenre = detectRequestedGenre(userMessage);

  if (requestedGenre) {
    filtered = applyStrictFilter(
      filtered,
      (book) => filterByRequestedGenre([book], requestedGenre).length > 0,
      state
    );
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
    "j.k. rowling",
    "james clear",
  ];

  for (const author of authorKeywords) {
    const normalizedAuthor = normalizeText(author);

    if (msg.includes(normalizedAuthor)) {
      filtered = applyStrictFilter(
        filtered,
        (book) =>
          normalizeText(book.author).includes(normalizedAuthor) ||
          bookText(book).includes(normalizedAuthor),
        state
      );
      break;
    }
  }

  const publisherKeywords = [
    "kim đồng",
    "kim dong",
    "nxb trẻ",
    "nxb tre",
    "nhã nam",
    "nha nam",
    "alphabooks",
    "first news",
    "đinh tị",
    "dinh ti",
    "mcbooks",
    "thaihabooks",
  ];

  for (const publisher of publisherKeywords) {
    const normalizedPublisher = normalizeText(publisher);

    if (msg.includes(normalizedPublisher)) {
      filtered = applyStrictFilter(
        filtered,
        (book) =>
          normalizeText(book.publisher).includes(normalizedPublisher) ||
          bookText(book).includes(normalizedPublisher),
        state
      );
      break;
    }
  }

  const languageKeywords = {
    "Tiếng Việt": ["tiếng việt", "tieng viet", "sách việt"],
    English: ["english", "tiếng anh", "tieng anh", "sách tiếng anh"],
    Japanese: ["japanese", "tiếng nhật", "tieng nhat"],
    Chinese: ["chinese", "tiếng trung", "tieng trung"],
  };

  for (const [language, keywords] of Object.entries(languageKeywords)) {
    if (includesAny(msg, keywords)) {
      filtered = applyStrictFilter(
        filtered,
        (book) =>
          normalizeText(book.language).includes(normalizeText(language)) ||
          bookText(book).includes(normalizeText(language)),
        state
      );
      break;
    }
  }

  const budget = parseBudget(userMessage);

  if (budget) {
    filtered = applyStrictFilter(
      filtered,
      (book) => {
        const price = Number(book.price || 0);

        if (budget.mode === "lte") {
          return price <= budget.value;
        }

        return price >= budget.value * 0.6 && price <= budget.value * 1.4;
      },
      state
    );
  }

  if (
    includesAny(msg, [
      "sale",
      "giảm giá",
      "giam gia",
      "khuyến mãi",
      "khuyen mai",
      "ưu đãi",
      "uu dai",
    ])
  ) {
    filtered = applyStrictFilter(
      filtered,
      (book) => Number(book.originalPrice || 0) > Number(book.price || 0),
      state
    );
  }

  if (
    includesAny(msg, [
      "bán chạy",
      "ban chay",
      "best seller",
      "bestseller",
      "hot",
      "nổi bật",
      "noi bat",
    ])
  ) {
    state.hasSpecificIntent = true;
    filtered = sortByPriority(filtered);
  }

  if (
    includesAny(msg, [
      "sách mới",
      "sach moi",
      "mới xuất bản",
      "moi xuat ban",
      "new book",
    ])
  ) {
    state.hasSpecificIntent = true;

    filtered = [...filtered].sort(
      (a, b) =>
        Number(b.publishYear || b.year || 0) -
        Number(a.publishYear || a.year || 0)
    );
  }

  if (
    includesAny(msg, [
      "còn hàng",
      "con hang",
      "có sẵn",
      "co san",
      "available",
    ])
  ) {
    filtered = applyStrictFilter(
      filtered,
      (book) => Number(book.stock || 0) > 0,
      state
    );
  }

  const inStock = filtered.filter((book) => Number(book.stock || 0) > 0);

  if (inStock.length > 0) {
    filtered = inStock;
  }

  if (filtered.length === 0) {
    console.log("Không tìm thấy sách phù hợp với bộ lọc chat.", {
      requestedGenre,
      userMessage,
    });

    return [];
  }

  return sortByPriority(filtered).slice(0, MAX_BOOKS);
}

export const filterRelevantProducts = filterRelevantBooks;

export function validateInput(userMessage) {
  if (!userMessage || typeof userMessage !== "string") {
    return {
      valid: false,
      message: "Bạn muốn tìm sách gì ạ?",
    };
  }

  const trimmed = userMessage.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      message: "Bạn muốn tìm sách gì ạ?",
    };
  }

  if (trimmed.length > 500) {
    return {
      valid: false,
      message:
        "Câu hỏi hơi dài quá bạn ơi. Bạn có thể nói ngắn gọn hơn được không?",
    };
  }

  const normalized = normalizeText(trimmed);
  const spamPatterns = /(.)\1{10,}|^[^a-z0-9\s]+$/i;

  if (spamPatterns.test(normalized)) {
    return {
      valid: false,
      message:
        "Mình chưa hiểu rõ. Bạn có thể nói lại tên sách, thể loại, tác giả hoặc mức giá bạn muốn tìm không?",
    };
  }

  return { valid: true };
}