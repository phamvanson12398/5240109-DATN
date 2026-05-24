
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createProduct, updateProduct } from '@/features/admin/state/adminSlice';
import { toast } from 'react-toastify';
import { getLevel1Categories, getLevel2Categories } from '@/shared/constants/categories';
import { BOOK_GENRE_OPTIONS } from '@/shared/constants/aiSettings';
import '../styles/ProductFormModal.css';

function ProductFormModal({ product, onClose, initialData }) {
    const dispatch = useDispatch();
    const isEditMode = !!product;

    const [formData, setFormData] = useState({
        name: "",
        description: "",

        price: 0,
        originalPrice: 0,
        stock: 1,

        // category
        categoryLevel1: "",
        categoryLevel2: "",

        // sách
        author:"",
        publisher: "",
        publishYear: "",
        page: "",
        language: "",

        // ảnh
        images: [],
        oldImages: [],

        // trạng thái
        status: "available",

        keyword: '',
    });

    const [imagesPreview, setImagesPreview] = useState([]);
    const [tempTag, setTempTag] = useState({ size: '', color: '' });
    const [discountPercent, setDiscountPercent] = useState(0);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                description: product.description || "",

                // Giá & kho
                price: product.price || 0,
                originalPrice: product.originalPrice || 0,
                stock: product.stock || 1,
                sold: product.sold || 0,

                // Danh mục 2 cấp
                categoryLevel1: product.category?.level1 || "",
                categoryLevel2: product.category?.level2 || "",

                // Thông tin sách
                author: product.author || "",
                publisher: product.publisher || "",
                publishYear: product.publishYear || "",
                page: product.page || "",
                language: product.language || "Tiếng Việt",

                // Hình ảnh
                images: [],
                oldImages: product.images || [],

                // Trạng thái
                status: product.status || "available",

                // Từ khóa / phân loại thêm
                keyword: product.keyword || [],
                level: product.level || "",

                // Review
                ratings: product.ratings || 0,
                numOfReviews: product.numOfReviews || 0,
            });

            setImagesPreview(product.images?.map((img) => img.url) || []);
        } else if (initialData) {
            setFormData((prev) => ({
                ...prev,
                ...initialData,
            }));
        }
    }, [product, initialData]);

    // Calculate discount automatically
    useEffect(() => {
        const price = Number(formData.price);
        const original = Number(formData.originalPrice);
        if (original > price && price > 0) {
            const discount = Math.round(((original - price) / original) * 100);
            setDiscountPercent(discount);
        } else {
            setDiscountPercent(0);
        }
    }, [formData.price, formData.originalPrice]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "categoryLevel1") {
            setFormData((prev) => ({
                ...prev,
                categoryLevel1: value,
                categoryLevel2: "",
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Combine existing images for upload logic
        // Note: In real app, you might want to append, not replace if multiple=true
        setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview((old) => [...old, reader.result]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {

        const newPreviews = [...imagesPreview];
        newPreviews.splice(index, 1);
        setImagesPreview(newPreviews);

        const oldImagesCount = formData.oldImages.length;

        if (index < oldImagesCount) {
            // Remove from oldImages
            const newOldImages = [...formData.oldImages];
            newOldImages.splice(index, 1);
            setFormData(prev => ({ ...prev, oldImages: newOldImages }));
        } else {
            // Remove from new images array
            const newImageIndex = index - oldImagesCount;
            const newImages = [...formData.images];
            newImages.splice(newImageIndex, 1);
            setFormData(prev => ({ ...prev, images: newImages }));
        }
    };

    // const addTag = (type) => {
    //     const value = tempTag[type === 'sizes' ? 'size' : 'color'];
    //     if (!value.trim()) return;
    //     if (formData[type].includes(value.trim())) {
    //         toast.warning(`${value} đã tồn tại!`);
    //         return;
    //     }
    //     setFormData(prev => ({
    //         ...prev,
    //         [type]: [...prev[type], value.trim()]
    //     }));
    //     setTempTag(prev => ({ ...prev, [type === 'sizes' ? 'size' : 'color']: '' }));
    // };

    const handleTagKeyDown = (e, type) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(type);
        }
    };

    const removeTag = (type, valueToRemove) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter(val => val !== valueToRemove)
        }));
    };

    // Drag & Drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            // Trigger same logic as input change
            // Create simulated event or just call logic
            setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
            files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = () => {
                    if (reader.readyState === 2) {
                        setImagesPreview((old) => [...old, reader.result]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const myForm = new FormData();

        myForm.set("name", formData.name);
        myForm.set("price", formData.price);
        myForm.set("originalPrice", formData.originalPrice);
        myForm.set("stock", formData.stock);

        myForm.set(
            "category",
            JSON.stringify({
                level1: formData.categoryLevel1,
                level2: formData.categoryLevel2,
            })
        );

        myForm.set("description", formData.description);

        // Thông tin sách
        myForm.set("publisher", formData.publisher || "");
        myForm.set("author", formData.author || "");
        myForm.set("publishYear", formData.publishYear || "");
        myForm.set("page", formData.page || "");
        myForm.set("language", formData.language || "Tiếng Việt");

        // Trạng thái
        myForm.set("status", formData.status || "available");

        // Optional
        myForm.set("level", formData.level || "");

         myForm.set("keyword", formData.keyword || "");
       
        // Append new images
        formData.images.forEach((image) => {
            myForm.append("images", image);
        });


        if (formData.oldImages && formData.oldImages.length > 0) {

            myForm.set('oldImages', JSON.stringify(formData.oldImages));
        }

        try {
            if (isEditMode) {
                await dispatch(updateProduct({ id: product._id, productData: myForm })).unwrap();
                toast.success('Cập nhật sản phẩm thành công!');
            } else {
                await dispatch(createProduct(myForm)).unwrap();
                toast.success('Thêm sản phẩm thành công!');
            }
            // Gọi onClose để đóng modal và làm mới dữ liệu ở component cha
            onClose();
        } catch (error) {
            toast.error(error || 'Có lỗi xảy ra khi lưu sản phẩm!');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="product-modal">
                {/* Header */}
                <div className="modal-header">
                    <h2>{isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form className="product-form" onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="modal-grid">
                            {/* Left Column */}
                            <div>
                                {/* Basic Info */}
                                <div className="form-section-block">
                                    <h3 className="section-title">
                                        <svg className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Thông tin cơ bản
                                    </h3>
                                    <div className="form-group">
                                        <label className="form-label required">Tên sản phẩm</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-input"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Nhập tên sản phẩm..."
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label required">Danh mục cấp 1</label>
                                        <select
                                            name="categoryLevel1"
                                            className="form-select"
                                            value={formData.categoryLevel1}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Chọn cấp 1</option>
                                            {getLevel1Categories().map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>


                                    <div
                                        className="form-group"
                                        style={{ marginTop: '10px' }}
                                    >
                                        <label className="form-label required">
                                            Danh mục cấp 2
                                        </label>

                                        <select
                                            name="categoryLevel2"
                                            className="form-select"
                                            value={formData.categoryLevel2}
                                            onChange={handleChange}
                                            required
                                            disabled={!formData.categoryLevel1}
                                        >
                                            <option value="">
                                                Chọn cấp 2
                                            </option>

                                            {getLevel2Categories(formData.categoryLevel1)
                                                .map((cat) => (

                                                    <option
                                                        key={cat.value}
                                                        value={cat.value}
                                                    >
                                                        {cat.label}
                                                    </option>

                                                ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Mô tả</label>
                                        <textarea
                                            name="description"
                                            className="form-textarea"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Mô tả chi tiết sản phẩm..."
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="form-section-block">
                                    <h3 className="section-title">
                                        <svg className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Giá và tồn kho
                                    </h3>
                                    <div className="pricing-grid">
                                        <div className="form-group">
                                            <label className="form-label required">Giá bán</label>
                                            <div className="input-with-suffix">
                                                <input
                                                    type="number"
                                                    name="price"
                                                    className="form-input"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    required
                                                    min="0"
                                                />
                                                <span className="input-suffix">VND</span>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Giá gốc</label>
                                            <div className="input-with-suffix">
                                                <input
                                                    type="number"
                                                    name="originalPrice"
                                                    className="form-input"
                                                    value={formData.originalPrice}
                                                    onChange={handleChange}
                                                    min="0"
                                                />
                                                <span className="input-suffix">VND</span>
                                            </div>
                                        </div>
                                    </div>
                                    {discountPercent > 0 && (
                                        <span className="discount-badge">Giảm {discountPercent}%</span>
                                    )}
                                </div>

                                {/* Inventory */}
                                <div className="form-section-block">
                                    <h3 className="section-title">
                                        <svg className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        Tồn kho
                                    </h3>
                                    <div className="form-group">
                                        <label className="form-label required">Số lượng tồn kho</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            className="form-input"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div>
                                {/* Attributes */}
                                <div className="form-section-block">
                                    <h3 className="section-title">
                                        <svg className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        Thuộc tính
                                    </h3>
                                    <div className="form-group">
                                        <label className="form-label">Nhà xuất bản</label>
                                        <input
                                            type="text"
                                            name="publisher"
                                            className="form-input"
                                            value={formData.publisher}
                                            onChange={handleChange}
                                            placeholder="VD: Nam Cao, Tố Hữu..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tác giả</label>
                                        <input
                                            type="text"
                                            name="author"
                                            className="form-input"
                                            value={formData.author}
                                            onChange={handleChange}
                                            placeholder="VD: Tố Hữu..."
                                        />
                                    </div>

                                    {/*  */}
                                    <div className="form-group">
                                        <label className="form-label">Số trang</label>

                                        <input
                                            type="number"
                                            name="page"
                                            className="form-input"
                                            value={formData.page}
                                            onChange={handleChange}
                                            placeholder="VD: 320"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Năm xuất bản</label>

                                        <input
                                            type="number"
                                            name="publishYear"
                                            className="form-input"
                                            value={formData.publishYear}
                                            onChange={handleChange}
                                            placeholder="VD: 2000"
                                        />
                                    </div>


                                    <div className="form-group">
                                        <label className="form-label">Ngôn ngữ</label>

                                        <select
                                            name="language"
                                            className="form-select"
                                            value={formData.language}
                                            onChange={handleChange}
                                        >
                                            <option value="Tiếng Việt">Tiếng Việt</option>
                                            <option value="English">English</option>
                                            <option value="Japanese">Japanese</option>
                                            <option value="Chinese">Chinese</option>
                                        </select>
                                    </div>

                                    {/* AI Personal Stylist Fields */}
                                    <div className="form-section-block" style={{ marginTop: '20px', borderTop: '1px dashed #ddd', paddingTop: '15px' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                            <span style={{ marginRight: '8px' }}>✨</span> Thiết lập stylist AI
                                        </h4>
                                        <div className="form-group">
                                            <label className="form-label">Từ khóa</label>
                                            <select
                                                name="keyword"
                                                className="form-select"
                                                value={formData.keyword}
                                                onChange={handleChange}
                                            >
                                                <option value="">Chọn Từ khóa</option>
                                                {BOOK_GENRE_OPTIONS.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.icon} {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                    </div>
                                </div>

                                {/* Media */}
                                <div className="form-section-block">
                                    <h3 className="section-title">
                                        <svg className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Hình ảnh
                                    </h3>
                                    <div
                                        className="image-upload-area"
                                        onClick={() => document.getElementById('imageInput').click()}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        <svg className="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="upload-text">Bấm để tải ảnh hoặc kéo thả vào đây</p>
                                        <p className="upload-hint">Hỗ trợ JPG, PNG, GIF</p>
                                    </div>
                                    <input
                                        id="imageInput"
                                        type="file"
                                        name="images"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        multiple
                                        style={{ display: 'none' }}
                                    />

                                    <div className="image-preview-grid">
                                        {imagesPreview.map((img, index) => (
                                            <div key={index} className="image-preview-item">
                                                <img src={img} alt={`Preview ${index}`} />
                                                <button
                                                    type="button"
                                                    className="image-remove"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn btn-primary">
                            {isEditMode ? 'Cập nhật' : 'Tạo sản phẩm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductFormModal;
