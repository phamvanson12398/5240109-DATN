export const PRICE_MIN = 0;

export const PRICE_MAX = 30000000;

export const PRODUCT_FILTER_RATINGS = [5, 4, 3, 2, 1];

export const PRODUCT_PRICE_PRESETS = [
  { label: "Dưới 50k", min: 0, max: 50000 },
  { label: "50k - 100k", min: 50000, max: 100000 },
  { label: "100k - 200k", min: 100000, max: 200000 },
  { label: "Trên 200k", min: 200000, max: PRICE_MAX },
];

export const PRODUCT_CATEGORY_TREE = [
  {
    title: "SÁCH VIỆT NAM",

    items: [
      {
        label: "Văn học",
        value: "Văn học",
      },

      {
        label: "Kinh tế & Kỹ năng",
        value: "Kinh tế & Kỹ năng",
      },

      {
        label: "Thiếu nhi",
        value: "Thiếu nhi",
      },

      {
        label: "Truyện tranh",
        value: "Truyện tranh",
      },

      {
        label: "Tâm lý - Kỹ năng sống",
        value: "Tâm lý - Kỹ năng sống",
      },

      {
        label: "Lịch sử",
        value: "Lịch sử",
      },
    ],
  },

  {
    title: "FOREIGN BOOKS",

    items: [
      {
        label: "Literature",
        value: "Literature",
      },

      {
        label: "Business",
        value: "Business",
      },

      {
        label: "Self-help",
        value: "Self-help",
      },

      {
        label: "Fantasy",
        value: "Fantasy",
      },

      {
        label: "Mystery",
        value: "Mystery",
      },

      {
        label: "Children Books",
        value: "Children Books",
      },
    ],
  },
];