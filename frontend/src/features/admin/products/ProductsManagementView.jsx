
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AddIcon from '@mui/icons-material/Add';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import WhatshotOutlinedIcon from '@mui/icons-material/WhatshotOutlined';
import { fetchAllProducts, deleteProduct } from '@/features/admin/state/adminSlice';
import { selectAdminProducts } from '@/features/admin/state/adminSelectors';
import { formatVND } from '@/shared/utils/formatCurrency';
import './styles/ProductsManagement.css';
import ProductFormModal from '@/features/admin/products/components/ProductFormModal';
import ImportProductModal from '@/features/admin/products/components/ImportProductModal';
import StockManagement from '@/features/admin/products/components/StockManagement';
import { BOOK_GENRE_OPTIONS } from '@/shared/constants/aiSettings';
import { categoryApi } from "@/features/admin/categorys/api/categoryApi.js";
/**
 * ProductsManagement - Nội dung trang quản lý sản phẩm (không có layout)
 */
function ProductsManagementView() {
    const dispatch = useDispatch();
    const { products, loading, error, globalSearchQuery } = useSelector(selectAdminProducts);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [initialFormData, setInitialFormData] = useState(null);
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'stock'
    const [filterStyle, setFilterStyle] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryApi.fetchCategories();
                setCategories(data || []);
            } catch (error) {
                console.log("Lỗi lấy category:", error);
            }
        };

        fetchCategories();
    }, []);

    // Fetch products khi component mount
    useEffect(() => {
        dispatch(fetchAllProducts());
    }, [dispatch]);

    // Hiển thị error
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Xử lý xóa sản phẩm
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            try {
                await dispatch(deleteProduct(id)).unwrap();
                toast.success('Xóa sản phẩm thành công!');
            } catch (err) {
                toast.error(err || 'Xóa sản phẩm thất bại');
            }
        }
    };

    // Xử lý edit
    const handleEdit = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    // Xử lý add new
    const handleAddNew = (data = null) => {
        setSelectedProduct(null);
        setInitialFormData(data);
        setShowModal(true);
    };

    // Reload products after import
    const handleImportSuccess = () => {
        dispatch(fetchAllProducts());
    };
    const getCategoryNameById = (categoryId) => {
        const id =
            typeof categoryId === "object"
                ? categoryId?._id
                : categoryId;

        const category = categories.find((item) => item._id === id);

        return category?.name || "Chưa có danh mục";
    };

    const getProductCategory = (product) => {


        const level1Name = getCategoryNameById(product.category.level1);
        const level2Name = getCategoryNameById(product.category.level2);

        return (
            <div className="product-category-tree">
                <strong>{level1Name}</strong>
                <span>└─ {level2Name}</span>
            </div>
        );
    };
    const getProductCode = (product) => {
        return product.sku || product._id?.slice(-8)?.toUpperCase() || 'NO-ID';
    };

    if (loading && products.length === 0) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    // Filter products based on global search query
    const filteredProducts = products.filter(product => {
        if (!globalSearchQuery) return true;
        const searchLower = globalSearchQuery.toLowerCase();

        // Cố gắng lấy chuỗi danh mục an toàn
        let categoryStr = '';
        if (typeof product.category === 'string') {
            categoryStr = product.category;
        } else if (product.category && typeof product.category === 'object') {
            categoryStr = product.category.level1 || '';
        }

        return (
            (product.name && product.name.toLowerCase().includes(searchLower)) ||
            (product.style && product.style.toLowerCase().includes(searchLower)) ||
            (product.vibe && product.vibe.toLowerCase().includes(searchLower)) ||
            categoryStr.toLowerCase().includes(searchLower)
        ) && (
                filterStyle === '' || product.style === filterStyle
            );
    });

    return (
        <div className="products-page-content">
            <div className="products-header">
                <div>
                    <h2 className="products-page-title">Quản lý sản phẩm</h2>
                    <p className="products-subtitle">Quản lý kho hàng và trạng thái hiển thị của các bộ sưu tập.</p>
                </div>
                <div className="products-header-actions">
                    <button type="button" className="btn-import-product" onClick={() => setShowImportModal(true)}>
                        <FileUploadOutlinedIcon />
                        Nhập Excel/CSV
                    </button>
                    <button type="button" className="btn-add-product" onClick={handleAddNew}>
                        <AddIcon />
                        Thêm sản phẩm mới
                    </button>
                </div>
            </div>

            <div className="products-tabs">
                <button
                    type="button"
                    className={`products-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    <Inventory2OutlinedIcon />
                    Danh sách sản phẩm
                </button>
                <button
                    type="button"
                    className={`products-tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stock')}
                >
                    <BarChartOutlinedIcon />
                    Nhập hàng
                </button>
            </div>

            {activeTab === 'list' && (
                <div className="products-filter-bar">
                    <div className="products-filter-control">
                        <FilterListOutlinedIcon />
                        <label htmlFor="products-style-filter">Thể loại</label>
                        <select
                            id="products-style-filter"
                            className="products-style-select"
                            value={filterStyle}
                            onChange={(e) => setFilterStyle(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            {BOOK_GENRE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>

                    <div className="products-filter-meta">
                        <span>Hiển thị {filteredProducts?.length || 0} / Tổng số {products?.length || 0} sản phẩm</span>
                        {filterStyle && (
                            <button
                                type="button"
                                className="btn-clear-filter"
                                onClick={() => setFilterStyle('')}
                            >
                                <ClearOutlinedIcon />
                                Xóa lọc
                            </button>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'list' && (
                <>
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Sách</th>
                                    <th>Giá</th>
                                    <th>Danh mục</th>
                                    <th>Tồn kho</th>
                                    <th>Đã bán</th>
                                    <th>Đánh giá</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts && filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product._id}>
                                            <td>
                                                <div className="product-cell">
                                                    {(() => {
                                                        const imgUrl = product.images?.[0]?.url;
                                                        const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect fill="%23f4f4f2" width="60" height="60" rx="8"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23a8a29e" font-size="12" font-family="sans-serif">Chưa có ảnh</text></svg>';
                                                        return (
                                                            <img
                                                                src={imgUrl && imgUrl.startsWith('http') ? imgUrl : placeholder}
                                                                alt={product.name}
                                                                className="product-thumbnail"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = placeholder;
                                                                }}
                                                            />
                                                        );
                                                    })()}
                                                    <div className="product-cell-info">
                                                        <strong>{product.name}</strong>
                                                        <span>{getProductCode(product)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="product-price">{formatVND(product.price)}</td>

                                            <td className="product-category">{getProductCategory(product)}</td>
                                            <td>
                                                <span className={`product-stock-badge ${product.stock < 10 ? 'low' : ''}`} >
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`product-sold-badge ${product.stock < 10 ? 'low' : ''}`} style={{ color: "green" }}>
                                                    {product.sold}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="products-rating">
                                                    <StarRoundedIcon />
                                                    {product.ratings?.toFixed(1) || 0} ({product.numOfReviews || 0})
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => handleEdit(product)}
                                                        title="Sửa"
                                                        type="button"
                                                    >
                                                        <EditOutlinedIcon />
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(product._id)}
                                                        title="Xóa"
                                                        type="button"
                                                    >
                                                        <DeleteOutlineIcon />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="no-products">
                                            <div className="products-empty-state">
                                                <SearchOffOutlinedIcon />
                                                <strong>
                                                    {globalSearchQuery
                                                        ? `Không tìm thấy sản phẩm nào khớp với "${globalSearchQuery}"`
                                                        : "Chưa có sản phẩm nào"}
                                                </strong>
                                                <span>Thử thay đổi bộ lọc hoặc thêm sản phẩm mới vào hệ thống.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === 'stock' && <StockManagement onAddNew={handleAddNew} />}

            {/* Modal - ProductForm */}
            {showModal && (
                <ProductFormModal
                    product={selectedProduct}
                    initialData={initialFormData}
                    onClose={() => {
                        setShowModal(false);
                        setInitialFormData(null);
                        setSelectedProduct(null);
                    }}
                />
            )}

            {/* Modal - Import Products */}
            {showImportModal && (
                <ImportProductModal
                    onClose={() => setShowImportModal(false)}
                    onImportSuccess={handleImportSuccess}
                />
            )}
        </div>
    );
}

export default ProductsManagementView;
