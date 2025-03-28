import React, { useState, useEffect, useRef } from "react";
import ToastMessage from "./ToastMessage";

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterOptions) => void;
    initialFilters?: FilterOptions;
}

export interface FilterOptions {
    categories: string[];
    rating: number;
    priceRange: [number, number];
    playerCount: string; // Changed to string for player type selection
    currentPlayerCount: string;
}

const FilterModal: React.FC<FilterModalProps> = ({
    isOpen,
    onClose,
    onApply,
    initialFilters,
}) => {
    const defaultFilters: FilterOptions = {
        categories: [],
        rating: 4,
        priceRange: [0, 100000],
        playerCount: "싱글 플레이어", // Default value changed
        currentPlayerCount: "0~1,000명",
    };

    const [filters, setFilters] = useState<FilterOptions>(
        initialFilters || defaultFilters
    );
    const [showToast, setShowToast] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>("카테고리");

    // Refs for each section to enable scrolling
    const categoryRef = useRef<HTMLDivElement>(null);
    const ratingRef = useRef<HTMLDivElement>(null);
    const priceRef = useRef<HTMLDivElement>(null);
    const playerCountRef = useRef<HTMLDivElement>(null); // Kept original name for consistency
    const currentPlayerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialFilters) {
            setFilters(initialFilters);
        }
    }, [initialFilters, isOpen]);

    // Scroll to section when tab is clicked
    const scrollToSection = (sectionId: string) => {
        setActiveTab(sectionId);

        // ID를 사용하여 모달 컨텐츠 요소를 선택합니다
        const modalContentElement = document.getElementById(
            "filter-modal-content"
        );

        // 헤더 높이 (탭 포함)
        const headerHeight = 120; // 대략적인 높이값, 필요에 따라 조정

        let targetRef;
        switch (sectionId) {
            case "카테고리":
                targetRef = categoryRef.current;
                break;
            case "평점":
                targetRef = ratingRef.current;
                break;
            case "가격":
                targetRef = priceRef.current;
                break;
            case "인원":
                targetRef = playerCountRef.current; // Kept original name
                break;
            case "동접자":
                targetRef = currentPlayerRef.current;
                break;
            default:
                return;
        }

        if (targetRef && modalContentElement) {
            // 모달 내부에서의 타겟 요소의 상대적 위치 계산
            const targetOffsetTop = targetRef.offsetTop;

            // 헤더 높이를 고려하여 스크롤 위치 계산
            modalContentElement.scrollTo({
                top: targetOffsetTop - headerHeight,
                behavior: "smooth",
            });
        }
    };

    const tabs = ["카테고리", "평점", "가격", "인원", "동접자"];

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

    // Player type options
    const playerCountOptions = ["싱글 플레이어", "멀티 플레이어"];

    const currentPlayerOptions = [
        "0~1,000명",
        "1,000~10,000명",
        "10,000~50,000명",
        "50,000~100,000명",
        "100,000~500,000명",
        "500,000명 이상",
    ];

    const toggleCategory = (category: string) => {
        const newCategories = [...filters.categories];

        if (newCategories.includes(category)) {
            // Remove the category if already selected
            const index = newCategories.indexOf(category);
            newCategories.splice(index, 1);
            setFilters({ ...filters, categories: newCategories });
        } else {
            // Add the category if not already selected and less than 5 categories selected
            if (newCategories.length < 5) {
                newCategories.push(category);
                setFilters({ ...filters, categories: newCategories });
            } else {
                // Show toast when trying to select more than 5 categories
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 3000);
            }
        }
    };

    const handleRatingChange = (rating: number) => {
        setFilters({ ...filters, rating });
    };

    const handlePriceChange = (min: number, max: number) => {
        setFilters({ ...filters, priceRange: [min, max] });
    };

    // Handler for player count (now player type)
    const handlePlayerCountChange = (option: string) => {
        setFilters({ ...filters, playerCount: option });
    };

    const handleCurrentPlayerCountChange = (option: string) => {
        setFilters({ ...filters, currentPlayerCount: option });
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    if (!isOpen) return null;

    // Function to get button styling for categories
    const getCategoryButtonStyle = (category: string) => {
        const isSelected = filters.categories.includes(category);
        return `px-3 py-2 text-sm rounded-md whitespace-nowrap text-center ${
            isSelected
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-800"
        }`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
            <div
                id="filter-modal-content"
                className="bg-white rounded-t-lg w-full h-4/5 px-4 overflow-y-auto"
                style={{
                    transform: isOpen ? "translateY(0)" : "translateY(100%)",
                    transition: "transform 0.3s ease-out",
                    width: "402px",
                }}
            >
                <div className="sticky top-0 p-4 bg-white">
                    <div className="bg-white z-10 flex justify-between items-center pb-2 border-b">
                        <h2 className="text-xl font-bold">필터</h2>
                        <button onClick={onClose} className="p-1">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tab Navigation - Sticky at the top */}
                <div className="sticky top-12 bg-white z-10 flex border-b overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`px-4 py-3 text-center whitespace-nowrap ${
                                activeTab === tab
                                    ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                                    : "text-gray-600"
                            }`}
                            onClick={() => scrollToSection(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* All sections displayed at once for scrolling */}
                <div className="pt-4 space-y-8">
                    {/* Category Section */}
                    <div ref={categoryRef} className="pt-2 pb-6">
                        <h3 className="text-lg font-medium my-2">카테고리</h3>
                        <div className="py-4">
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={getCategoryButtonStyle(
                                            category
                                        )}
                                        onClick={() => toggleCategory(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Rating Section */}
                    <div ref={ratingRef} className="pt-2 pb-6">
                        <h3 className="text-lg font-medium my-2">평점</h3>
                        <div className="py-4">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() =>
                                                handleRatingChange(star)
                                            }
                                            className="text-3xl mx-1"
                                        >
                                            {star <= filters.rating ? (
                                                <span className="text-yellow-400">
                                                    ★
                                                </span>
                                            ) : (
                                                <span className="text-yellow-200">
                                                    ★
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price Section */}
                    <div ref={priceRef} className="pt-2 pb-6">
                        <h3 className="text-lg font-medium my-2">가격</h3>
                        <div className="py-4">
                            <div className="flex items-center justify-between">
                                <div className="px-2 py-2 rounded w-24 text-center">
                                    {filters.priceRange[0].toLocaleString()} 원
                                </div>
                                <span className="mx-2">~</span>
                                <div className="px-2 py-2 rounded w-24 text-center">
                                    {filters.priceRange[1].toLocaleString()} 원
                                </div>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="200000"
                                step="10000"
                                value={filters.priceRange[1]}
                                onChange={(e) =>
                                    handlePriceChange(
                                        filters.priceRange[0],
                                        parseInt(e.target.value)
                                    )
                                }
                                className="w-full mt-4 accent-orange-500"
                            />
                        </div>
                    </div>

                    {/* Player Count Section - Now Player Type (modified to match currentPlayer layout) */}
                    <div ref={playerCountRef} className="pt-2 pb-6">
                        <h3 className="text-lg font-medium my-2">인원</h3>
                        <div className="py-4">
                            <div className="grid grid-cols-2 gap-3">
                                {playerCountOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center"
                                    >
                                        <input
                                            type="radio"
                                            id={`player-count-${index}`}
                                            name="playerCount"
                                            checked={
                                                filters.playerCount === option
                                            }
                                            onChange={() =>
                                                handlePlayerCountChange(option)
                                            }
                                            className="mr-2 accent-orange-500"
                                        />
                                        <label
                                            htmlFor={`player-count-${index}`}
                                        >
                                            {option}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Current Player Count Section */}
                    <div ref={currentPlayerRef} className="pt-2 pb-6">
                        <h3 className="text-lg font-medium my-2">동접자</h3>
                        <div className="py-4">
                            <div className="grid grid-cols-2 gap-3">
                                {currentPlayerOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center"
                                    >
                                        <input
                                            type="radio"
                                            id={`current-player-${index}`}
                                            name="currentPlayerCount"
                                            checked={
                                                filters.currentPlayerCount ===
                                                option
                                            }
                                            onChange={() =>
                                                handleCurrentPlayerCountChange(
                                                    option
                                                )
                                            }
                                            className="mr-2 accent-orange-500"
                                        />
                                        <label
                                            htmlFor={`current-player-${index}`}
                                        >
                                            {option}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Buttons */}
                <div className="sticky bottom-0 bg-white pt-2 pb-2 flex justify-end space-x-3">
                    <button
                        className="px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-700"
                        onClick={onClose}
                    >
                        취소
                    </button>
                    <button
                        className="px-6 py-2 rounded-full bg-orange-500 text-white"
                        onClick={handleApply}
                    >
                        적용
                    </button>
                </div>

                {/* Toast Message Container */}
            </div>
            <div className="h-16 mb-4 z-10">
                {showToast && (
                    <ToastMessage message="카테고리는 5개까지 선택할 수 있어요." />
                )}
            </div>
        </div>
    );
};

export default FilterModal;
