import Category from "../models/categoryModel.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("parentId", "name description")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getChildCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      parentId: { $ne: null }
    })
      .populate("parentId", "name description")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getLevel1CategoriesController = async (req, res) => {
  try {
    const categories = await Category.find({
      parentId: null,
      status: "active"
    }).sort({ createdAt: -1 });

    const data = categories.map((item) => ({
      value: item._id.toString(),
      label: item.name
    }));

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getLevel2CategoriesController = async (req, res) => {
  try {
    const { level1 } = req.params;

    const categories = await Category.find({
      parentId: level1,
      status: "active"
    }).sort({ createdAt: -1 });

    const data = categories.map((item) => ({
      value: item._id.toString(),
      label: item.name
    }));

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "parentId",
      "name description"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy category",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tên danh mục là bắt buộc",
      });
    }

    const category = await Category.create({
      name,
      description,
      parentId: parentId || null,
    });

    res.status(201).json({
      success: true,
      message: "Tạo category thành công",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        parentId: parentId || null,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy category",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật category thành công",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy category",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa category thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};