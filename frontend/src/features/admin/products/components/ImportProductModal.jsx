
import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { importProducts, importProductsPreCheck } from '@/features/admin/state/adminSlice';
import { selectAdminLoading } from '@/features/admin/state/adminSelectors';
import { toast } from 'react-toastify';
import { formatVND } from '@/shared/utils/formatCurrency';
import * as XLSX from 'xlsx';
import '../styles/ImportProductModal.css';

/**
 * ImportProductModal - Modal import sản phẩm từ Excel/CSV
 */
function ImportProductModal({ onClose, onImportSuccess }) {
    const dispatch = useDispatch();
    const loading = useSelector(selectAdminLoading);
    const fileInputRef = useRef(null);

    const [previewData, setPreviewData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);

    const REQUIRED_FIELDS = ['sku', 'name', 'description', 'price', 'stock', 'category_level1'];

    // Hàm tìm dòng chứa Header thực sự
    const findHeaderRow = (rows) => {
        for (let i = 0; i < Math.min(rows.length, 20); i++) {
            const row = rows[i];
            if (Array.isArray(row) && row.some(cell =>
                typeof cell === 'string' &&
                (cell.toLowerCase().includes('name') || cell.toLowerCase().includes('tên'))
            )) {
                return i;
            }
        }
        return 0; // Mặc định là dòng đầu nếu không tìm thấy
    };

    // Parse file Excel/CSV
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
        ];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            toast.error('Chỉ hỗ trợ file .xlsx, .xls hoặc .csv');
            return;
        }

        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Đọc thô toàn bộ rows để tìm Header
                const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const headerIdx = findHeaderRow(rawRows);

                // Parse lại dữ liệu từ dòng Header đã tìm thấy
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    range: headerIdx,
                    defval: ''
                });

                if (jsonData.length === 0) {
                    toast.error('File không chứa dữ liệu');
                    return;
                }

                // Map and Validate each row
                const errors = [];
                const mappedData = jsonData.map((row, idx) => {
                    const mappedRow = { ...row };

                    // Linh hoạt map tiêu đề cho category (bao gồm cả định dạng category.level1)
                    if (!mappedRow.sku) {
                        mappedRow.sku = row['sku'] || row['SKU'] || row['Mã SP'] || row['Mã sản phẩm'];
                    }
                    if (!mappedRow.category_level1) {
                        mappedRow.category_level1 = row['category_level1'] || row['category.level1'] || row['Category Level 1'] || row['Danh mục cấp 1'] || row['Danh mục Cấp 1'] || row['level1'];
                    }
                    if (!mappedRow.category_level2) {
                        mappedRow.category_level2 = row['category_level2'] || row['category.level2'] || row['Category Level 2'] || row['Danh mục cấp 2'] || row['Danh mục Cấp 2'] || row['level2'];
                    }

                    // --- Mapping AI Stylist fields ---
                    if (!mappedRow.keyword) {
                        mappedRow.vibe = row['keyword'] || row['Keyword'] || row['Từ khóa'] || row['key'];
                    }


                    // Thỏa mãn validation cũ nếu file có field 'category' hoặc 'Danh mục'
                    if (!mappedRow.category_level1) {
                        const oldCat = row['category'] || row['Category'] || row['Danh mục'];
                        if (oldCat) mappedRow.category_level1 = oldCat;
                    }

                    const missing = REQUIRED_FIELDS.filter(f => !mappedRow[f] && mappedRow[f] !== 0);
                    if (missing.length > 0) {
                        errors.push({ row: idx + 1, name: mappedRow.name || '', message: `Thiếu: ${missing.join(', ')}` });
                    }
                    if (mappedRow.price && (isNaN(mappedRow.price) || Number(mappedRow.price) <= 0)) {
                        errors.push({ row: idx + 1, name: mappedRow.name || '', message: 'Giá không hợp lệ' });
                    }
                    if (mappedRow.stock !== '' && (isNaN(mappedRow.stock) || Number(mappedRow.stock) < 0)) {
                        errors.push({ row: idx + 1, name: mappedRow.name || '', message: 'Số lượng không hợp lệ' });
                    }
                    return mappedRow;
                });

                const validSkus = mappedData
                    .filter((_, idx) => !errors.find(e => e.row === idx + 1) && _.sku)
                    .map(r => String(r.sku).trim());

                let preCheckData = [];
                if (validSkus.length > 0) {
                    try {
                        const preCheckRes = await dispatch(importProductsPreCheck(validSkus)).unwrap();
                        preCheckData = preCheckRes.results || [];
                    } catch {
                        toast.warning('Không thể kiểm tra sản phẩm trùng lặp theo SKU');
                    }
                }

                const finalData = mappedData.map((row) => {
                    const existing = preCheckData.find(item => item.sku === String(row.sku).trim() && item.exists);
                    if (existing) {
                        return { ...row, _isExisting: true, _existingName: existing.name, _existingStock: existing.currentStock, _existingId: existing._id, _importMode: 'accumulate' };
                    }
                    return { ...row, _isExisting: false, _importMode: 'create' };
                });

                setPreviewData(finalData);
                setValidationErrors(errors);
            } catch (err) {
                toast.error('Không thể đọc file: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleModeChange = (index, mode) => {
        setPreviewData(prev => {
            const newData = [...prev];
            newData[index] = { ...newData[index], _importMode: mode };
            return newData;
        });
    };

    // Handle import
    const handleImport = async () => {
        const errorRows = new Set(validationErrors.map(e => e.row));
        const validData = previewData.filter((row, idx) => !errorRows.has(idx + 1) && row._importMode !== 'skip');

        if (validData.length === 0) {
            toast.error('Không có sản phẩm hợp lệ để nhập dữ liệu (hoặc tất cả đã bị bỏ qua)');
            return;
        }

        try {
            const result = await dispatch(importProducts(validData)).unwrap();

            // Build success message showing both imported and updated counts
            const messages = [];
            if (result.imported > 0) messages.push(`🆕 Thêm mới ${result.imported} sản phẩm`);
            if (result.updated > 0) messages.push(`🔄 Cập nhật ${result.updated} sản phẩm`);
            toast.success(`✅ ${messages.join(', ')}`);

            if (result.failed > 0) {
                toast.warning(`⚠️ ${result.failed} sản phẩm lỗi`);
            }
            onImportSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err?.message || err || 'Nhập dữ liệu thất bại');
        }
    };

    // Generate and download template
    const handleDownloadTemplate = () => {
        const template = [
            {
                // Trạng thái
                status: "available",


                // SKU
                sku: "BOOK001",

                // Tên sách
                name: "Cho Tôi Xin Một Vé Đi Tuổi Thơ",

                // Mô tả
                description:
                    "Tác phẩm nổi tiếng của Nguyễn Nhật Ánh đưa người đọc trở về với thế giới tuổi thơ hồn nhiên, trong sáng và đầy cảm xúc.",

                // Giá bán
                price: 85000,

                // Giá gốc
                originalPrice: 99000,

                // Tồn kho
                stock: 120,

                // Danh mục cấp 1 (ID Category)
                category_level1: "6a196237765954cad1a84ac6",

                // Danh mục cấp 2 (ID Category)
                category_level2: "6a196291765954cad1a84ae5",

                // Tác giả
                author: "Nguyễn Nhật Ánh",

                // Nhà xuất bản
                publisher: "NXB Trẻ",

                // Năm xuất bản
                publishYear: 2023,

                // Số trang
                page: 208,

                // Ngôn ngữ
                language: "Tiếng Việt",

                // Keyword (String)
                keyword: "tuoi-tho"


            },

            {
                // Trạng thái
                status: "available",


                // SKU
                sku: "BOOK002",

                // Tên sách
                name: "Atomic Habits",

                // Mô tả
                description:
                    "Cuốn sách bán chạy của James Clear hướng dẫn cách xây dựng thói quen tốt, loại bỏ thói quen xấu và tạo ra những thay đổi tích cực lâu dài.",

                // Giá bán
                price: 320000,

                // Giá gốc
                originalPrice: 399000,

                // Tồn kho
                stock: 45,

                // Danh mục cấp 1 (ID Category)
                category_level1: "6a196590765954cad1a84b45",

                // Danh mục cấp 2 (ID Category)
                category_level2: "6a26469692f10942f691e8ad",

                // Tác giả
                author: "James Clear",

                // Nhà xuất bản
                publisher: "Penguin Random House",

                // Năm xuất bản
                publishYear: 2020,

                // Số trang
                page: 320,

                // Ngôn ngữ
                language: "English",

                // Keyword (String)
                keyword: "atomic-habits"


            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Products');
        XLSX.writeFile(wb, 'template_import_san_pham.xlsx');
    };

    const errorRows = new Set(validationErrors.map(e => e.row));
    const validCount = previewData.filter((row, idx) => !errorRows.has(idx + 1) && row._importMode !== 'skip').length;
    const errorCount = validationErrors.length;

    return (
        <div className="import-modal-overlay" onClick={onClose}>
            <div className="import-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="import-modal-header">
                    <h2>📥 Nhập sản phẩm từ Excel/CSV <span style={{ fontSize: '12px', color: '#999' }}>(v2.0)</span></h2>
                    <button className="import-modal-close" onClick={onClose}>×</button>
                </div>

                {/* Upload Area */}
                <div className="import-upload-area" onClick={() => fileInputRef.current?.click()}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        hidden
                    />
                    {fileName ? (
                        <div className="upload-file-info">
                            <span className="upload-icon">📄</span>
                            <span className="upload-filename">{fileName}</span>
                            <span className="upload-change">Bấm để đổi file</span>
                        </div>
                    ) : (
                        <div className="upload-placeholder">
                            <span className="upload-icon">📎</span>
                            <p>Kéo thả hoặc click để chọn file</p>
                            <span className="upload-hint">Hỗ trợ: .xlsx, .xls, .csv</span>
                        </div>
                    )}
                </div>

                {/* Preview Table */}
                {previewData.length > 0 && (
                    <>
                        <div className="import-stats" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span className="stat-valid">✅ {validCount} hợp lệ</span>
                                {errorCount > 0 && <span className="stat-error">❌ {errorCount} lỗi</span>}
                                <span className="stat-total">📦 Tổng: {previewData.length} dòng</span>
                            </div>

                            {previewData.some(row => row._isExisting) && (
                                <div className="bulk-action" style={{ background: '#f8f9fa', padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd' }}>
                                    <label style={{ marginRight: '8px', fontSize: '13px', fontWeight: 'bold', color: '#333' }}> Áp dụng cho SP cũ:</label>
                                    <select
                                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                                        onChange={(e) => {
                                            const mode = e.target.value;
                                            if (!mode) return;
                                            setPreviewData(prev => prev.map(row =>
                                                row._isExisting ? { ...row, _importMode: mode } : row
                                            ));
                                        }}
                                    >
                                        <option value="">-- Chọn hành động --</option>
                                        <option value="accumulate">Cập nhật (Cộng dồn)</option>
                                        <option value="overwrite">Cập nhật (Ghi đè)</option>
                                        <option value="skip">Bỏ qua</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="import-preview-container">
                            <table className="import-preview-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>

                                        <th>SKU</th>

                                        <th>Tên sách</th>

                                        <th>Giá</th>

                                        <th>Tồn kho</th>

                                        <th>Danh mục</th>

                                        <th>Thể loại</th>

                                        <th>Nhà xuất bản</th>

                                        <th>Năm XB</th>

                                        <th>Ngôn ngữ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.slice(0, 50).map((row, idx) => {
                                        const rowError = validationErrors.find(e => e.row === idx + 1);
                                        return (
                                            <tr
                                                key={idx}
                                                className={
                                                    rowError
                                                        ? 'row-error'
                                                        : row._isExisting
                                                            ? 'row-warning'
                                                            : 'row-valid'
                                                }
                                            >
                                                <td>{idx + 1}</td>

                                                {/* Status */}
                                                <td>
                                                    {rowError ? (
                                                        <span
                                                            className="status-error"
                                                            title={rowError.message}
                                                        >
                                                            ❌ Lỗi
                                                        </span>
                                                    ) : row._isExisting ? (
                                                        <span
                                                            className="status-warning"
                                                            title="Đã tồn tại"
                                                            style={{
                                                                color: '#d97706',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            ⚠️ Đã tồn tại
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className="status-valid"
                                                            style={{
                                                                color: '#16a34a',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            ✨ Mới
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Action */}
                                                <td>
                                                    {!rowError && row._isExisting ? (
                                                        <select
                                                            value={row._importMode}
                                                            onChange={(e) =>
                                                                handleModeChange(idx, e.target.value)
                                                            }
                                                            style={{
                                                                padding: '4px',
                                                                borderRadius: '4px',
                                                                border: '1px solid #ccc'
                                                            }}
                                                        >
                                                            <option value="accumulate">
                                                                Cập nhật (Cộng dồn)
                                                            </option>

                                                            <option value="overwrite">
                                                                Cập nhật (Ghi đè)
                                                            </option>

                                                            <option value="skip">
                                                                Bỏ qua
                                                            </option>
                                                        </select>
                                                    ) : !rowError ? (
                                                        <span style={{ color: '#16a34a' }}>
                                                            Thêm mới
                                                        </span>
                                                    ) : (
                                                        <span>—</span>
                                                    )}
                                                </td>

                                                {/* SKU */}
                                                <td>
                                                    {row.sku || (
                                                        <em className="empty-cell">—</em>
                                                    )}
                                                </td>

                                                {/* Tên sách */}
                                                <td>
                                                    {row.name || (
                                                        <em className="empty-cell">—</em>
                                                    )}
                                                </td>

                                                {/* Giá */}
                                                <td>
                                                    {row.price
                                                        ? formatVND(row.price)
                                                        : <em className="empty-cell">—</em>}
                                                </td>

                                                {/* Kho */}
                                                <td>
                                                    {rowError ? (
                                                        row.stock
                                                    ) : row._isExisting &&
                                                        row._importMode === 'accumulate' ? (
                                                        <span
                                                            title={`Cũ: ${row._existingStock} + Mới: ${row.stock}`}
                                                        >
                                                            {row._existingStock}{' '}
                                                            <strong style={{ color: 'green' }}>
                                                                +{row.stock}
                                                            </strong>
                                                        </span>
                                                    ) : (
                                                        row.stock ?? (
                                                            <em className="empty-cell">—</em>
                                                        )
                                                    )}
                                                </td>

                                                {/* Danh mục */}
                                                <td>
                                                    {row.category_level1 ||
                                                        row['Category Level 1'] || (
                                                            <em className="empty-cell">—</em>
                                                        )}
                                                </td>

                                                {/* Thể loại */}
                                                <td>
                                                    {row.category_level2 ||
                                                        row['Category Level 2'] || (
                                                            <em className="empty-cell">—</em>
                                                        )}
                                                </td>

                                                {/* Nhà xuất bản */}
                                                <td>
                                                    {row.publisher || (
                                                        <em className="empty-cell">
                                                            Chưa có NXB
                                                        </em>
                                                    )}
                                                </td>

                                                {/* Năm XB */}
                                                <td>
                                                    {row.publishYear || (
                                                        <em className="empty-cell">—</em>
                                                    )}
                                                </td>

                                                {/* Ngôn ngữ */}
                                                <td>
                                                    {row.language || (
                                                        <em className="empty-cell">
                                                            Tiếng Việt
                                                        </em>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {previewData.length > 50 && (
                                <p className="preview-truncated">... và {previewData.length - 50} dòng khác</p>
                            )}
                        </div>

                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <div className="import-errors">
                                <h4>⚠️ Chi tiết lỗi:</h4>
                                <ul>
                                    {validationErrors.slice(0, 10).map((err, i) => (
                                        <li key={i}>Dòng {err.row}: <strong>{err.name || '(trống)'}</strong> — {err.message}</li>
                                    ))}
                                    {validationErrors.length > 10 && (
                                        <li>... và {validationErrors.length - 10} lỗi khác</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </>
                )}

                {/* Actions */}
                <div className="import-modal-actions">
                    <button className="btn-download-template" onClick={handleDownloadTemplate}>
                        📥 Tải template mẫu
                    </button>
                    <div className="import-actions-right">
                        <button className="btn-cancel" onClick={onClose}>Hủy</button>
                        <button
                            className="btn-import"
                            onClick={handleImport}
                            disabled={loading || previewData.length === 0 || validCount === 0}
                        >
                            {loading ? '⏳ Đang nhập dữ liệu...' : `✅ Nhập ${validCount} sản phẩm`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImportProductModal;
