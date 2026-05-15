export const CATEGORY_TREE = {
  sach_viet_nam: {
    label: "SÁCH VIỆT NAM",
    children: [
      { label: "Văn học", value: "van_hoc" },
      { label: "Kinh tế & Kỹ năng", value: "kinh_te_ky_nang" },
      { label: "Thiếu nhi", value: "thieu_nhi" },
      { label: "Truyện tranh", value: "truyen_tranh" },
      { label: "Tâm lý - Kỹ năng sống", value: "tam_ly_ky_nang_song" },
      { label: "Lịch sử", value: "lich_su" }
    ]
  },

  foreign_books: {
    label: "FOREIGN BOOKS",
    children: [
      { label: "Literature", value: "literature" },
      { label: "Business", value: "business" },
      { label: "Self-help", value: "self_help" },
      { label: "Fantasy", value: "fantasy" },
      { label: "Mystery", value: "mystery" },
      { label: "Children Books", value: "children_books" }
    ]
  },
};

// Lấy danh mục cấp 1
export const getLevel1Categories = () => {
  return Object.entries(CATEGORY_TREE).map(([value, item]) => ({
    value,
    label: item.label
  }));
};

export const getLevel2Categories = (level1) => {
  if (!level1 || !CATEGORY_TREE[level1]) return [];

  return CATEGORY_TREE[level1].children;
};