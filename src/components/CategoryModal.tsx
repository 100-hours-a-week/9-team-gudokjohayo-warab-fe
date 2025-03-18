import React, { useState, useEffect } from "react";
import ToastMessage from "./ToastMessage";

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (categories: string[]) => void;
    initialSelectedCategories: string[];
}

const CategoryModal: React.FC<CategoryModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialSelectedCategories,
}) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initialSelectedCategories
    );
    const [showToast, setShowToast] = useState<boolean>(false);

    useEffect(() => {
        setSelectedCategories(initialSelectedCategories);
    }, [initialSelectedCategories, isOpen]);

    const categories = [
        "타이쿤",
        "온라인 멀티",
        "공포",
        "추리",
        "퍼즐",
        "스포츠",
        "어드벤처",
        "심인",
        "VR",
        "시뮬레이션",
        "멀티플레이어",
        "슈팅",
        "미소녀 연애 시뮬레이션",
        "액션",
        "실시간 전략",
        "오픈 월드",
        "핵 앤 슬래시",
        "전략",
        "캐주얼",
        "카드",
        "힐링",
        "격투",
        "리듬",
        "레이싱",
    ];

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(
                selectedCategories.filter((c) => c !== category)
            );
        } else {
            if (selectedCategories.length < 5) {
                setSelectedCategories([...selectedCategories, category]);
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
        onConfirm(selectedCategories);
        onClose();
    };

    if (!isOpen) return null;

    // Function to get random button styling for a more natural layout
    const getButtonStyle = (category: string) => {
        const isSelected = selectedCategories.includes(category);
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

                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((category, index) => (
                        <button
                            key={index}
                            type="button"
                            className={getButtonStyle(category)}
                            onClick={() => toggleCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                        className="px-6 py-2 rounded-full bg-orange-500 text-white text-sm"
                        onClick={handleConfirm}
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
