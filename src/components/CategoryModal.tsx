import React, { useState, useEffect } from "react";
import ToastMessage from "./ToastMessage";
import { getAllCategories } from "../services/categoryService";

interface Category {
    id: number;
    name: string;
}

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (categoryIds: number[]) => void;
    initialSelectedCategoryIds: number[];
}

const CategoryModal: React.FC<CategoryModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialSelectedCategoryIds,
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
        initialSelectedCategoryIds
    );
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Reset selected categories when modal opens
    useEffect(() => {
        setSelectedCategoryIds(initialSelectedCategoryIds);
    }, [initialSelectedCategoryIds, isOpen]);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            if (!isOpen) return;

            setIsLoading(true);
            setError(null);

            try {
                const categoriesData = await getAllCategories();
                setCategories(categoriesData);
            } catch (err) {
                console.error("Failed to load categories:", err);
                setError("카테고리를 불러오는데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, [isOpen]);

    const toggleCategory = (categoryId: number) => {
        if (selectedCategoryIds.includes(categoryId)) {
            setSelectedCategoryIds(
                selectedCategoryIds.filter((id) => id !== categoryId)
            );
        } else {
            if (selectedCategoryIds.length < 5) {
                setSelectedCategoryIds([...selectedCategoryIds, categoryId]);
            } else {
                // Show toast when trying to select more than 5 categories
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 3000);
            }
        }
    };

    const handleConfirm = () => {
        onConfirm(selectedCategoryIds);
        onClose();
    };

    if (!isOpen) return null;

    // Function to get random button styling for a more natural layout
    const getButtonStyle = (categoryId: number) => {
        const isSelected = selectedCategoryIds.includes(categoryId);
        // Base width classes - varying widths
        const widthClasses = ["", "min-w-max"];
        const randomWidth =
            widthClasses[Math.floor(Math.random() * widthClasses.length)];

        return `px-3 py-2 text-sm rounded-md whitespace-nowrap text-center ${randomWidth} ${
            isSelected
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-800"
        }`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
                className="bg-white rounded-lg w-full max-w-md mx-4 p-6"
                style={{ width: "360px" }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">선호 카테고리</h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <p>카테고리를 불러오는 중...</p>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                className={getButtonStyle(category.id)}
                                onClick={() => toggleCategory(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex justify-center">
                    <button
                        className="px-6 py-2 rounded-full bg-orange-500 text-white text-sm"
                        onClick={handleConfirm}
                        disabled={isLoading || error !== null}
                    >
                        선택 완료
                    </button>
                </div>
            </div>
            <div className="h-16 mb-4 z-10">
                {showToast && (
                    <ToastMessage message="카테고리는 5개까지 선택할 수 있어요." />
                )}
            </div>
        </div>
    );
};

export default CategoryModal;
