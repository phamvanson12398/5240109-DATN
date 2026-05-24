import express from "express";
import { chat, clearHistory, getStats } from "../controllers/aiController.js";

const router = express.Router();

// Main chat endpoint
router.post("/chat", chat);

// Clear session history
router.post("/chat/clear", clearHistory);

// Get stats (debug)
router.get("/chat/stats", getStats);

export default router;
