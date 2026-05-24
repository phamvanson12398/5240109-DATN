import { useCategoryManagement } from "./hooks/useCategoryManagement";
import CategoryHeader from "./components/CategoryHeader";
import CategoryStats from "./components/CategoryStats";
import CategoryFilter from "./components/CategoryFilter";
import CategoryTable from "./components/CategoryTable";
import CategoryPagination from "./components/CategoryPagination";
import CategoryModal from "./components/CategoryModal";
import DeleteCategoryModal from "./components/DeleteCategoryModal";
import EditCategoryModal from "./components/EditCategoryModal";
import "./styles/category.css";

export default function CateManagementView() {
    const {
        categories,
        filteredCategories,
        searchTerm,
        setSearchTerm,
        isOpenModal,
        openModal,
        closeModal,
        isEditOpen,selectedCategory,
        handleUpdateCategory ,
        handleDeleteCategory ,
        isDeleteOpen
    } = useCategoryManagement();

    return (
        <main className="category-page">
            <div className="category-container category-stack">
                <CategoryHeader onOpenModal={openModal} />

                <div className="category-dashboard">
                    <CategoryStats total={categories.length} />

                    <CategoryFilter
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />
                </div>

                <div className="category-table-wrapper">
                    <CategoryTable categories={filteredCategories} />
                    <CategoryPagination total={categories.length} />
                </div>
            </div>

            {isOpenModal && <CategoryModal onClose={closeModal} />}
            
        </main>
    );
}