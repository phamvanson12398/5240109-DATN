import express from "express";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getChildCategories,
  getLevel1CategoriesController,
  getLevel2CategoriesController,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/child", getChildCategories);
router.get("/level-1", getLevel1CategoriesController);
router.get("/level-2/:level1", getLevel2CategoriesController);
router.get("/:id", getCategoryById);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;