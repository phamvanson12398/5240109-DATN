export const categoryApi = {
  
  // Lấy danh sách categories
  fetchCategories: async () => {
    const { data } = await axios.get("/api/v1/categories");
    return data.categories;
  },

  // Lấy category theo id
  fetchCategoryById: async (id) => {
    const { data } = await axios.get(`/api/v1/categories/${id}`);
    return data.category;
  },

  // Tạo category
  createCategory: async (categoryData) => {
    const { data } = await axios.post(
      "/api/v1/categories",
      categoryData
    );
    return data;
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    const { data } = await axios.put(
      `/api/v1/categories/${id}`,
      categoryData
    );
    return data;
  },

  // Xóa category
  deleteCategory: async (id) => {
    const { data } = await axios.delete(
      `/api/v1/categories/${id}`
    );
    return data;
  }
};