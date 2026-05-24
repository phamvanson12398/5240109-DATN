import { useState } from 'react';
import EditCategoryModal from './EditCategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';

export default function CategoryTable({ categories }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleOpenEdit = (category) => {
        setSelectedCategory(category);
        setIsEditOpen(true);
    };

    const handleOpenDelete = (category) => {
        setSelectedCategory(category);
        setIsDeleteOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditOpen(false);
        setSelectedCategory(null);
    };

    const handleCloseDelete = () => {
        setIsDeleteOpen(false);
        setSelectedCategory(null);
    };

    const handleSaveEdit = (updatedCategory) => {
        console.log('Danh mục sau khi sửa:', updatedCategory);

        // Sau này gọi API update ở đây
        // dispatch(updateCategory(updatedCategory));

        handleCloseEdit();
    };

    const handleConfirmDelete = (category) => {
        console.log('Danh mục cần xóa:', category);

        // Sau này gọi API delete ở đây
        // dispatch(deleteCategory(category.id || category._id));

        handleCloseDelete();
    };

    return (
        <>
            <div className="category-table-scroll">
                <table className="category-table">
                    <thead>
                        <tr>
                            <th>Tên danh mục</th>
                            <th>Mô tả</th>
                            <th className="category-actions">
                                Thao tác
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id || category._id}>
                                <td>
                                    <div className="category-cell">
                                        <div className="category-icon-box">
                                            <span className="material-symbols-outlined">
                                                {category.icon || 'menu_book'}
                                            </span>
                                        </div>

                                        <span className="category-name">
                                            {category.name}
                                        </span>
                                    </div>
                                </td>

                                <td className="category-description">
                                    {category.description}
                                </td>

                                <td className="category-actions">
                                    <button
                                        type="button"
                                        className="category-action-btn category-edit-btn"
                                        onClick={() => handleOpenEdit(category)}
                                    >
                                        <span className="material-symbols-outlined">
                                            edit
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        className="category-action-btn category-delete-btn"
                                        onClick={() => handleOpenDelete(category)}
                                    >
                                        <span className="material-symbols-outlined">
                                            delete
                                        </span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <EditCategoryModal
                isOpen={isEditOpen}
                category={selectedCategory}
                onClose={handleCloseEdit}
                onSave={handleSaveEdit}
            />

            <DeleteCategoryModal
                isOpen={isDeleteOpen}
                category={selectedCategory}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}