import axios from "@/shared/api/http.js";

export const categoryApi = {
  fetchCategories: async () => {
    const { data } = await axios.get("/api/v1/categories");
    return data.data;
  },

  fetchCategoryById: async (categoryId) => {
    const { data } = await axios.get(
      `/api/v1/categories/${categoryId}`
    );
    return data.data;
  },

  createCategory: async ({ name, description, parentId }) => {
    const { data } = await axios.post("/api/v1/categories", {
      name,
      description,
      parentId,
    });

    return data;
  },

  updateCategory: async (categoryId, { name, description, parentId }) => {
    const { data } = await axios.put(
      `/api/v1/categories/${categoryId}`,
      {
        name,
        description,
        parentId,
      }
    );

    return data;
  },

  deleteCategory: async (categoryId) => {
    const { data } = await axios.delete(
      `/api/v1/categories/${categoryId}`
    );

    return data;
  },
};