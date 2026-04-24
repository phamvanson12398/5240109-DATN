import express from "express";

const router = express.Router();

const API_URL = "https://provinces.open-api.vn/api/v1";

// Helper function to handle fetch
const proxyFetch = async (url, res, transform = (data) => data) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
        return res.status(response.status).json({ success: false, message: `API Error: ${response.status}` });
    }
    const data = await response.json();
    res.status(200).json(transform(data));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ROUTES SEARCH (Đặt trên các route tham số để tránh xung đột) ---
router.get("/p/search", (req, res) => {
  const { q } = req.query;
  proxyFetch(`${API_URL}/p/search/?q=${q}`, res);
});

router.get("/d/search", (req, res) => {
  const { q } = req.query;
  proxyFetch(`${API_URL}/d/search/?q=${q}`, res);
});

router.get("/w/search", (req, res) => {
  const { q } = req.query;
  proxyFetch(`${API_URL}/w/search/?q=${q}`, res);
});

// --- ROUTES CHÍNH ---

// Lấy danh sách tỉnh/thành (/p hoặc /p/)
router.get("/p", (req, res) => {
  proxyFetch(`${API_URL}/p/`, res);
});

// Lấy danh sách quận/huyện theo tỉnh (/p/:code)
router.get("/p/:code", (req, res) => {
  const { code } = req.params;
  const depth = req.query.depth || 1;
  proxyFetch(`${API_URL}/p/${code}?depth=${depth}`, res);
});

// Lấy danh sách phường/xã theo huyện (/d/:code)
router.get("/d/:code", (req, res) => {
  const { code } = req.params;
  const depth = req.query.depth || 1;
  proxyFetch(`${API_URL}/d/${code}?depth=${depth}`, res);
});

export default router;
