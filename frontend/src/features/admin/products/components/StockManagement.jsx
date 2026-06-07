
import React, { useState, useRef, useEffect } from 'react';
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
    useEffect(() => {
        if (!importResult?.notFound?.length || products.length === 0) return;

        const existingProductNames = new Set(products.map((product) => normalizeSearchText(product.name)));
        const remainingNotFound = importResult.notFound.filter(
            (item) => !existingProductNames.has(normalizeSearchText(item.name))
        );

        if (remainingNotFound.length !== importResult.notFound.length) {
            setImportResult((prev) => ({
                ...prev,
                notFound: remainingNotFound,
            }));
        }
    }, [importResult, products]);
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
            status: "available",
            name: "7 Thói Quen Hiệu Quả - The 7 Habits Of Highly Effective People",
            description: "edfsf",
            price: 67000,
            originalPrice: 99000,
            stock: 200,
            sold: 0,

            category_level1: "6a196237765954cad1a84ac6",
            category_level2: "6a196966765954cad1a84bfb",

            publisher: "Dale Carnegie",
            publishYear: 2000,
            page: 100,
            language: "Tiếng Việt",
            ratings: 0,
            numOfReviews: 0,
            status: "available",
            keyword: "",
            level: "",
            author: "Thế giới"
        },
        {
            status: "available",
            name: "Cho Tôi Xin Một Vé Đi Tuổi Thơ",
            description: "Sách văn học Việt Nam",
            price: 85000,
            originalPrice: 100000,
            stock: 120,
            sold: 0,

            category_level1: "ID_DANH_MUC_CAP_1",
            category_level2: "ID_DANH_MUC_CAP_2",

            publisher: "NXB Trẻ",
            publishYear: 2023,
            page: 208,
            language: "Tiếng Việt",
            ratings: 0,
            numOfReviews: 0,
            keyword: "van_hoc",
            level: "",
            author: "Nguyễn Nhật Ánh"
        },
        {
            status: "available",
            name: "Atomic Habits",
            description: "An easy and proven way to build good habits and break bad ones",
            price: 320000,
            originalPrice: 390000,
            stock: 45,
            sold: 0,

            category_level1: "ID_DANH_MUC_CAP_1",
            category_level2: "ID_DANH_MUC_CAP_2",

            publisher: "Penguin Random House",
            publishYear: 2020,
            page: 320,
            language: "English",
            ratings: 0,
            numOfReviews: 0,
            keyword: "self_help",
            level: "",
            author: "James Clear"
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
