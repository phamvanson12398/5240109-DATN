import { useCategoryManagement } from "./hooks/useCategoryManagement";

import CategoryHeader from "./components/CategoryHeader";
import CategoryStats from "./components/CategoryStats";
import CategoryFilter from "./components/CategoryFilter";
import CategoryTable from "./components/CategoryTable";
import CategoryPagination from "./components/CategoryPagination";
import CategoryModal from "./components/CategoryModal";

import "./styles/category.css";

export default function CateManagementView() {
    const {
        categories,
        filteredCategories,
        paginatedCategories,

        searchTerm,
        setSearchTerm,

        isOpenModal,
        openModal,
        closeModal,

        fetchCategories,

        currentPage,
        setCurrentPage,
        itemsPerPage,
    } = useCategoryManagement();

    const handleCloseCreateModal = async () => {
        closeModal();
        await fetchCategories();
    };

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
                    <CategoryTable
                        categories={paginatedCategories}
                        allCategories={filteredCategories}
                        fetchCategories={fetchCategories}
                    />

                    <CategoryPagination
                        total={filteredCategories.length}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {isOpenModal && (
                <CategoryModal onClose={handleCloseCreateModal} />
            )}
        </main>
    );
}