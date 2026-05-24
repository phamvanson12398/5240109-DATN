import { useMemo, useState } from "react";

const initialCategories = [
    {
        id: 1,
        name: "Văn học",
        description:
            "Bao gồm các tác phẩm văn học trong và ngoài nước, tiểu thuyết và thơ ca.",
        icon: "menu_book",
    },
    {
        id: 2,
        name: "Kinh tế",
        description:
            "Sách về quản trị kinh doanh, tài chính cá nhân và kinh tế vĩ mô.",
        icon: "trending_up",
    },
    {
        id: 3,
        name: "Kỹ năng sống",
        description:
            "Phát triển bản thân, tư duy tích cực và các kỹ năng mềm trong cuộc sống.",
        icon: "psychology",
    },
    {
        id: 4,
        name: "Ngoại ngữ",
        description:
            "Giáo trình tiếng Anh, Nhật, Hàn và các tài liệu luyện thi chứng chỉ.",
        icon: "language",
    },
    {
        id: 5,
        name: "Truyện tranh",
        description:
            "Manga, Comic và các thể loại tiểu thuyết hình ảnh dành cho mọi lứa tuổi.",
        icon: "auto_stories",
    },
];

export function useCategoryManagement() {
    const [categories] = useState(initialCategories);
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpenModal, setIsOpenModal] = useState(false);

    const filteredCategories = useMemo(() => {
        return categories.filter((item) =>
            `${item.name} ${item.description}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    return {
        categories,
        filteredCategories,
        searchTerm,
        setSearchTerm,
        isOpenModal,
        openModal: () => setIsOpenModal(true),
        closeModal: () => setIsOpenModal(false),
    };
}