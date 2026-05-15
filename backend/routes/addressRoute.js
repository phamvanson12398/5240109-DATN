import express from "express";
import { 
    addAddress, 
    getMyAddresses, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress 
} from "../controllers/addressController.js";
import { verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

const API_URL = "https://provinces.open-api.vn/api/v1";

// --- ROUTES CRUD ĐỊA CHỈ (Yêu cầu đăng nhập) ---
// 6.1 Thêm địa chỉ mới
router.post("/new", verifyUserAuth, addAddress);

// 6.2 Lấy danh sách địa chỉ của tôi
router.get("/me", verifyUserAuth, getMyAddresses);

// 6.3 Cập nhật địa chỉ
router.put("/:id", verifyUserAuth, updateAddress);

// 6.4 Xóa địa chỉ
router.delete("/:id", verifyUserAuth, deleteAddress);

// 6.5 Đặt địa chỉ mặc định
router.put("/default/:id", verifyUserAuth, setDefaultAddress);


// --- ROUTES PROXY (Dữ liệu Tỉnh/Thành/Quận/Huyện VN) ---
// Giữ nguyên logic cũ để Frontend không bị gián đoạn tính năng chọn địa chỉ

const proxyFetch = async (url, res) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
        return res.status(response.status).json({ success: false, message: `API Error: ${response.status}` });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.get("/p", (req, res) => {
  proxyFetch(`${API_URL}/p/`, res);
});

router.get("/p/search", (req, res) => {
  const { q } = req.query;
  proxyFetch(`${API_URL}/p/search/?q=${q}`, res);
});

router.get("/p/:code", (req, res) => {
  const { code } = req.params;
  const depth = req.query.depth || 1;
  proxyFetch(`${API_URL}/p/${code}?depth=${depth}`, res);
});

router.get("/d/:code", (req, res) => {
  const { code } = req.params;
  const depth = req.query.depth || 1;
  proxyFetch(`${API_URL}/d/${code}?depth=${depth}`, res);
});

router.get("/d/search", (req, res) => {
  const { q } = req.query;
  proxyFetch(`${API_URL}/d/search/?q=${q}`, res);
});

router.get("/w/search", (req, res) => {
  const { q } = req.query;
  proxyFetch(`${API_URL}/w/search/?q=${q}`, res);
});

export default router;
