/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Màn Hình Quản Lý Nhập Và Tồn Kho (Stock Management).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Đóng vai trò là "Thủ kho số". Giúp Admin kiểm soát chính xác số lượng hàng hóa đang có trong hệ thống.
 *    - Cung cấp 2 giải pháp nhập hàng linh hoạt: 
 *      + Giải pháp A: Nhập hàng loạt từ Excel (Phù hợp khi nhập kho định kỳ số lượng lớn).
 *      + Giải pháp B: Tra cứu và cập nhật nhanh từng sản phẩm (Phù hợp khi điều chỉnh kho lẻ).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị Kho hàng & Chuỗi cung ứng (Inventory & Supply Chain Management).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - SheetJS (XLSX): Tương tự Import sản phẩm nhưng logic ở đây chỉ quan tâm đến `name` và `quantity`. Chuyển đổi file Excel sang mảng JSON để xử lý.
 *    - Advanced Feedback Loop: Sau khi Import, Server trả về một Object `importResult` cực kỳ chi tiết bao gồm: Những SP đã cập nhật (có số `oldStock`, `newStock`) và những SP "Không tìm thấy".
 *    - Quick Action Integration (Lifting State Up): Một kỹ thuật hay! Nếu SP trong file Excel không tồn tại, hệ thống cung cấp nút "➕ Thêm mới". Khi bấm, nó sẽ gọi prop `onAddNew` truyền tên SP lên trang Cha để mở Modal tạo mới với tên đã có sẵn.
 *    - Single-Item Quick Update: Sử dụng một Object state `stockInputs` để quản lý cùng lúc nhiều ô Input số lượng trong bảng tìm kiếm. Mỗi ID sản phẩm sẽ là một Key trong Object (`{ product_id: quantity }`).
 *    - Real-time Stock Badge: Hiển thị trạng thái kho (Xanh/Đỏ). Nếu kho < 10, nhãn sẽ chuyển sang màu đỏ (`low` class) để cảnh báo Admin sắp hết hàng.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: File Excel nhập kho hoặc Từ khóa tìm kiếm tên sản phẩm.
 *    - Output: Số lượng `stock` trong Database được tăng thêm tương ứng với số lượng nhập vào.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `stockPreview`: Dữ liệu "tạm" từ file Excel hiện lên bảng cho Admin xem trước.
 *    - `importResult`: Dữ liệu "đối soát" từ Server trả về sau khi lưu thành công.
 *    - `stockInputs`: Lưu giá trị Admin đang gõ trong các ô nhập số lượng ở phần Tìm kiếm thủ công.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `handleImportStock`: Đẩy mảng dữ liệu nhập kho lên API Xử lý hàng loạt (Bulk Update).
 *    - `handleUpdateStock`: Cập nhật tồn kho cho đúng 1 sản phẩm đang chọn.
 *    - `handleSearch`: Gọi API tìm kiếm sản phẩm trong kho dữ liệu Admin.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Cách 1 (Excel): Chọn file -> Xem bản xem trước -> Bấm "Import" -> Nhận bảng kết quả đối soát kho cũ/mới.
 *    - Cách 2 (Manual): Gõ tên SP -> Bấm Tìm -> Thấy SP trong bảng -> Gõ số lượng nhập thêm (vd: 50) -> Bấm nút Check xanh -> Kho tự nhảy số.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Request Bulk: `POST /api/v1/admin/products/import-stock`.
 *    - Request Single: `PUT /api/v1/admin/products/update-stock/:id`.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Validation: File Excel bắt buộc có cột `name` và `quantity`. Số lượng nhập phải là số dương (> 0).
 *    - Report UI: Chỉ hiển thị bảng đối soát `importResult` sau khi đã có phản hồi từ Server.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Đọc file Excel bằng `FileReader`.
 *    - Các thao tác Dispatch Thunk (Search, Import, Update) với xử lý `unwrap()` để bắt lỗi API.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Khái niệm "Cộng dồn" (Accumulate): Khác với ghi đè, logic ở đây là `Tồn mới = Tồn cũ + Số lượng nhập`. Đây là logic nghiệp vụ thực tế của việc nhập hàng về kho.
 *    - Nút "Thêm mới" trong danh sách "Không tìm thấy": Đây là điểm nhấn UX, giúp Admin xử lý các mã hàng mới phát sinh ngay trong quá trình kiểm kho mà không cần chuyển đổi màn hình phức tạp.
 */
import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { importStock, updateSingleStock } from '@/features/admin/state/adminSlice';
import { selectAdminProducts } from '@/features/admin/state/adminSelectors';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import '../styles/StockManagement.css';

const normalizeSearchText = (value = '') =>
    String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

const getProductSearchIndex = (product) => {
    const categoryLabel =
        typeof product.category === 'object'
            ? [product.category?.level1, product.category?.level2, product.category?.level3]
                .filter(Boolean)
                .join(' ')
            : product.category || '';

    return normalizeSearchText([product.name, product.sku, categoryLabel].filter(Boolean).join(' '));
};

/**
 * StockManagement - Tab quản lý nhập hàng
 */
function StockManagement({ onAddNew }) {
    const dispatch = useDispatch();
    const { loading, products = [] } = useSelector(selectAdminProducts);
    const fileInputRef = useRef(null);

    // Import stock states
    const [stockPreview, setStockPreview] = useState([]);
    const [stockFileName, setStockFileName] = useState('');
    const [importResult, setImportResult] = useState(null);

    // Manual update states
    const [searchQuery, setSearchQuery] = useState('');
    const [stockInputs, setStockInputs] = useState({}); // { productId: quantity }

    // ===== IMPORT STOCK FROM FILE =====
    const handleStockFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStockFileName(file.name);
        setImportResult(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                if (jsonData.length === 0) {
                    toast.error('File không chứa dữ liệu');
                    return;
                }

                // Validate
                const validData = jsonData.filter(row => row.name && row.quantity && !isNaN(row.quantity) && Number(row.quantity) > 0);
                if (validData.length === 0) {
                    toast.error('File cần có cột "name" và "quantity" hợp lệ');
                    return;
                }

                setStockPreview(validData);
            } catch (err) {
                toast.error('Không thể đọc file: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImportStock = async () => {
        if (stockPreview.length === 0) return;

        try {
            const items = stockPreview.map(row => ({
                name: row.name,
                quantity: Number(row.quantity)
            }));

            const result = await dispatch(importStock(items)).unwrap();
            setImportResult(result);
            toast.success(`✅ Cập nhật ${result.updated} sản phẩm thành công!`);
            if (result.notFound?.length > 0) {
                toast.warning(`⚠️ ${result.notFound.length} sản phẩm không tìm thấy`);
            }
        } catch (err) {
            toast.error(err || 'Nhập tồn kho thất bại');
        }
    };

    const handleDownloadStockTemplate = () => {

        const template = [
            {
                // Trạng thái
                status: "available",

                // SKU
                sku: "BOOK02",

                // Tên sách
                name: "Cho Tôi Xin Một Vé Đi Tuổi Thơ",

                description:"test",
                // Giá
                price: 85000,

                // Tồn kho
                stock: 120,

                // Số lượng nhập thêm
                quantity: 100,

                // Danh mục cấp 1
                category_level1: "SÁCH VIỆT NAM",

                // Danh mục cấp 2
                category_level2: "Tiểu thuyết",

                
                // Nhà xuất bản
                publisher: "NXB Trẻ",

                // Năm XB
                publishYear: 2023,

                // Ngôn ngữ
                language: "Tiếng Việt",

                keyword: "van_hoc"
            },

            {
                status: "available",

                sku: "BOOKE009",

                name: "Atomic Habits",

                description:"test",

                price: 320000,

                stock: 45,

                quantity: 50,

                category_level1: "FOREIGN BOOKS",

                category_level2: "Self-help",

               

                publisher: "Penguin Random House",

                publishYear: 2020,

                language: "English",

                keyword: "van_hoc"
            },

            {
                status: "available",

                sku: "BOOK096",

                name: "Nhà Giả Kim",

                description:"test",

                price: 99000,

                stock: 80,

                quantity: 80,

                category_level1: "SÁCH VIỆT NAM",

                category_level2: "Tiểu thuyết",

                publisher: "NXB Hội Nhà Văn",

                publishYear: 2021,

                language: "Tiếng Việt",

                keyword: "van_hoc"
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);

        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            wb,
            ws,
            'Stock'
        );

        XLSX.writeFile(
            wb,
            'template_nhap_sach.xlsx'
        );
    };

    // ===== MANUAL STOCK UPDATE =====
    const handleSearch = () => {
        if (!searchQuery.trim()) {
            return;
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleStockInputChange = (productId, value) => {
        setStockInputs(prev => ({ ...prev, [productId]: value }));
    };

    const handleUpdateStock = async (productId) => {
        const quantity = Number(stockInputs[productId]);
        if (!quantity || quantity <= 0) {
            toast.warning('Nhập số lượng hợp lệ (> 0)');
            return;
        }

        try {
            await dispatch(updateSingleStock({ id: productId, quantity })).unwrap();
            toast.success('✅ Cập nhật tồn kho thành công!');
            setStockInputs(prev => ({ ...prev, [productId]: '' }));
        } catch (err) {
            toast.error(err || 'Cập nhật thất bại');
        }
    };

    const normalizedQuery = normalizeSearchText(searchQuery);
    const hasTypedQuery = normalizedQuery.length > 0;
    const liveResults = hasTypedQuery
        ? products.filter((product) => getProductSearchIndex(product).includes(normalizedQuery))
        : [];

    return (
        <div className="stock-management">
            {/* Section 1: Import from file */}
            <div className="stock-section">
                <div className="stock-section-header">
                    <h3>📥 Nhập hàng từ file Excel/CSV</h3>
                    <button className="btn-download-template-sm" onClick={handleDownloadStockTemplate}>
                        📥 Tải template
                    </button>
                </div>

                <div className="stock-upload-row">
                    <div
                        className="stock-upload-area"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleStockFileChange}
                            hidden
                        />
                        <span>📎 {stockFileName || 'Chọn file (name, quantity)'}</span>
                    </div>
                    <button
                        className="btn-import-stock"
                        onClick={handleImportStock}
                        disabled={loading || stockPreview.length === 0}
                    >
                        {loading ? '⏳...' : `📥 Nhập (${stockPreview.length})`}
                    </button>
                </div>

                {/* Stock Preview */}
                {stockPreview.length > 0 && (
                    <div className="stock-preview">
                        <table className="stock-preview-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Số lượng nhập</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockPreview.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{row.name}</td>
                                        <td className="qty-cell">+{Number(row.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Import Result */}
                {importResult && (
                    <div className="import-result-box">
                        <p className="result-success">✅ Cập nhật: {importResult.updated} sản phẩm</p>
                        {importResult.notFound?.length > 0 && (
                            <div className="result-notfound">
                                <p>❌ Không tìm thấy:</p>
                                <ul>
                                    {importResult.notFound.map((item, i) => (
                                        <li key={i} className="notfound-item">
                                            <span>{item.name} — {item.reason}</span>
                                            <button
                                                className="btn-add-missing"
                                                onClick={() => onAddNew({ name: item.name })}
                                                title="Thêm sản phẩm này vào hệ thống"
                                            >
                                                ➕ Thêm mới
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {importResult.details?.length > 0 && (
                            <div className="result-details">
                                <p>📊 Chi tiết:</p>
                                <table className="result-table">
                                    <thead>
                                        <tr>
                                            <th>Tên SP</th>
                                            <th>Tồn cũ</th>
                                            <th>Nhập thêm</th>
                                            <th>Tồn mới</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importResult.details.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.name}</td>
                                                <td>{item.oldStock}</td>
                                                <td className="qty-add">+{item.addedQty}</td>
                                                <td className="qty-new">{item.newStock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="stock-divider" />

            {/* Section 2: Manual update */}
            <div className="stock-section">
                <h3>🔍 Cập nhật tồn kho thủ công</h3>

                <div className="stock-search-row">
                    <input
                        type="text"
                        className="stock-search-input"
                        placeholder="Gõ tên sản phẩm, kết quả sẽ hiện ngay..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                    <button className="btn-search" onClick={handleSearch} disabled={loading}>
                        🔍 Lọc
                    </button>
                </div>

                {/* Search Results */}
                {hasTypedQuery && liveResults.length > 0 && (
                    <div className="stock-search-results">
                        <p className="stock-search-hint">
                            Tìm thấy {liveResults.length} sản phẩm khớp với "{searchQuery.trim()}"
                        </p>
                        <table className="stock-results-table">
                            <thead>
                                <tr>
                                    <th>Tên sản phẩm</th>
                                    <th>Danh mục</th>
                                    <th>Tồn kho</th>
                                    <th>Nhập thêm</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {liveResults.map((product) => (
                                    <tr key={product._id}>
                                        <td className="product-name-cell">
                                            {product.images?.[0]?.url && (
                                                <img src={product.images[0].url} alt="" className="mini-thumb" />
                                            )}
                                            {product.name}
                                        </td>
                                        <td>{typeof product.category === 'object' ? product.category?.level1 : product.category}</td>
                                        <td>
                                            <span className={`stock-badge ${product.stock < 10 ? 'low' : ''}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="stock-qty-input"
                                                placeholder="0"
                                                min="1"
                                                value={stockInputs[product._id] || ''}
                                                onChange={(e) => handleStockInputChange(product._id, e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="btn-update-stock"
                                                onClick={() => handleUpdateStock(product._id)}
                                                disabled={loading || !stockInputs[product._id]}
                                            >
                                                ✅
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {hasTypedQuery && liveResults.length === 0 && !loading && (
                    <div className="no-results-container">
                        <p className="no-results">Không tìm thấy sản phẩm nào khớp với "{searchQuery}"</p>
                        <button
                            className="btn-add-notfound"
                            onClick={() => onAddNew({ name: searchQuery })}
                        >
                            ➕ Thêm mới sản phẩm này
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StockManagement;
