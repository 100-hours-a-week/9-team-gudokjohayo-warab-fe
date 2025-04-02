import React, { useState, useEffect, useRef } from "react";
import ToastMessage from "./ToastMessage";
import RangeSlider from "./RangeSlider";

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterOptions) => void;
    onReset: () => void; // New reset handler
    initialFilters?: FilterOptions;
    categories: { category_id: number; category_name: string }[];
    categoriesLoading: boolean;
}

export interface FilterOptions {
    categories: string[];
    categoryIds?: number[]; // Added to store category IDs
    rating: number;
    priceRange: [number, number];
    playerRange: [number, number]; // For concurrent player count
    singlePlay: boolean; // For single player mode
    multiPlay: boolean; // For multi player mode
}

const FilterModal: React.FC<FilterModalProps> = ({
    isOpen,
    onClose,
    onApply,
    onReset, // New reset prop
    initialFilters,
    categories,
    categoriesLoading,
}) => {
    const defaultFilters: FilterOptions = {
        categories: [],
        categoryIds: [],
        rating: 4,
        priceRange: [0, 100000],
        playerRange: [0, 500000], // Default to full range
        singlePlay: false,
        multiPlay: false,
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
    const playerCountRef = useRef<HTMLDivElement>(null);
    const currentPlayerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialFilters) {
            setFilters(initialFilters);
        }
    }, [initialFilters, isOpen]);

    // disable 스크롤
    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(
                document.body
            ).overflow;
            document.body.style.overflow = "hidden";

            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

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
                targetRef = playerCountRef.current;
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

    // Concurrent player options - updated to match new requirements
    const concurrentPlayerOptions: {
        label: string;
        value: [number, number];
    }[] = [
        { label: "상관 없어요", value: [0, 500000] },
        { label: "한산해요", value: [0, 10000] },
        { label: "보통이에요", value: [10001, 100000] },
        { label: "북적여요", value: [100001, 500000] },
    ];

    const toggleCategory = (categoryName: string, categoryId: number) => {
        const newCategories = [...filters.categories];
        const newCategoryIds = [...(filters.categoryIds || [])];

        if (newCategories.includes(categoryName)) {
            // Remove the category if already selected
            const index = newCategories.indexOf(categoryName);
            newCategories.splice(index, 1);

            // Remove the category ID
            const idIndex = newCategoryIds.indexOf(categoryId);
            if (idIndex !== -1) {
                newCategoryIds.splice(idIndex, 1);
            }

            setFilters({
                ...filters,
                categories: newCategories,
                categoryIds: newCategoryIds,
            });
        } else {
            // Add the category if not already selected and less than 5 categories selected
            if (newCategories.length < 5) {
                newCategories.push(categoryName);
                newCategoryIds.push(categoryId);

                setFilters({
                    ...filters,
                    categories: newCategories,
                    categoryIds: newCategoryIds,
                });
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

    // New handler for player type (single/multi/none) segmented control
    const handlePlayerTypeChange = (type: "none" | "single" | "multi") => {
        if (type === "none") {
            setFilters({ ...filters, singlePlay: true, multiPlay: true });
        } else if (type === "single") {
            setFilters({ ...filters, singlePlay: true, multiPlay: false });
        } else if (type === "multi") {
            setFilters({ ...filters, singlePlay: false, multiPlay: true });
        }
    };

    // New handler for concurrent player count radio buttons
    const handleConcurrentPlayerChange = (range: [number, number]) => {
        setFilters({ ...filters, playerRange: range });
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    // New handler for reset button
    const handleReset = () => {
        setFilters(defaultFilters);
        onReset();
    };

    if (!isOpen) return null;

    const handleScroll = () => {
        const modalContentElement = document.getElementById(
            "filter-modal-content"
        );
        if (!modalContentElement) return;

        const scrollTop = modalContentElement.scrollTop;

        const offsets = [
            { id: "카테고리", ref: categoryRef },
            { id: "평점", ref: ratingRef },
            { id: "가격", ref: priceRef },
            { id: "인원", ref: playerCountRef },
            { id: "동접자", ref: currentPlayerRef },
        ];

        const headerHeight = 130; // 탭과 헤더 높이 고려하여 조정

        let currentTab = activeTab;

        for (let i = offsets.length - 1; i >= 0; i--) {
            const ref = offsets[i].ref.current;
            if (ref) {
                const offsetTop = ref.offsetTop - headerHeight;
                if (scrollTop >= offsetTop) {
                    currentTab = offsets[i].id;
                    break;
                }
            }
        }

        if (currentTab !== activeTab) {
            setActiveTab(currentTab);
        }
    };

    // Function to get button styling for categories
    const getCategoryButtonStyle = (categoryName: string) => {
        const isSelected = filters.categories.includes(categoryName);
        return `px-3 py-2 text-sm rounded-md whitespace-nowrap text-center ${
            isSelected
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-800"
        }`;
    };

    // Function to get current player type selection
    const getPlayerType = () => {
        if (filters.singlePlay && filters.multiPlay) return "none";
        if (filters.singlePlay) return "single";
        if (filters.multiPlay) return "multi";
        return "none";
    };

    // Helper to check if a specific playerRange is selected
    const isPlayerRangeSelected = (range: [number, number]) => {
        return (
            filters.playerRange[0] === range[0] &&
            filters.playerRange[1] === range[1]
        );
    };

    // Check if any filter has been applied
    const hasActiveFilters = () => {
        return (
            filters.categories.length > 0 ||
            filters.rating !== defaultFilters.rating ||
            filters.priceRange[0] !== defaultFilters.priceRange[0] ||
            filters.priceRange[1] !== defaultFilters.priceRange[1] ||
            filters.playerRange[0] !== defaultFilters.playerRange[0] ||
            filters.playerRange[1] !== defaultFilters.playerRange[1] ||
            filters.singlePlay !== defaultFilters.singlePlay ||
            filters.multiPlay !== defaultFilters.multiPlay
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
            <div
                id="filter-modal-content"
                className="bg-white rounded-t-lg w-full h-4/5 px-4 overflow-y-auto"
                style={{
                    maxHeight: "70vh",
                    transform: isOpen ? "translateY(0)" : "translateY(100%)",
                    transition: "transform 0.3s ease-out",
                    width: "402px",
                    borderTopLeftRadius: "1rem",
                    borderTopRightRadius: "1rem",
                    scrollbarGutter: "stable",
                    boxSizing: "border-box",
                    paddingRight: "16px",
                    overflow: "auto",
                    overscrollBehavior: "contain",

                    scrollbarColor: "#E5E7EB transparent",
                }}
                onScroll={handleScroll}
            >
                <style>
                    {`
                        #filter-modal-content {
                            border-top-left-radius: 1rem;
                            border-top-right-radius: 1rem;
                            overflow: auto;
                            clip-path: inset(0 round 1rem 1rem 0 0);
                        }
                        #filter-modal-content::-webkit-scrollbar {
                            width: 6px;
                            position: relative;
                            z-index: 1;
                        }
                        #filter-modal-content::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        #filter-modal-content::-webkit-scrollbar-thumb {
                            background-color: #E5E7EB;
                            border-radius: 3px;
                        }
                        .sticky {
                            position: sticky;
                            z-index: 2;
                            background-color: white;
                        }
                    `}
                </style>
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
                <div className="sticky top-12 bg-white z-10 flex border-b overflow-x-auto overflow-y-hidden">
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
                            {categoriesLoading ? (
                                <div className="flex justify-center">
                                    <p>카테고리를 불러오는 중...</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category.category_id}
                                            type="button"
                                            className={getCategoryButtonStyle(
                                                category.category_name
                                            )}
                                            onClick={() =>
                                                toggleCategory(
                                                    category.category_name,
                                                    category.category_id
                                                )
                                            }
                                        >
                                            {category.category_name}
                                        </button>
                                    ))}
                                </div>
                            )}
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

                    {/* Price Section - Updated with min and max sliders */}
                    <div ref={priceRef} className="pt-2 pb-6">
                        <h3 className="text-lg font-medium my-2">가격</h3>
                        <div className="py-4 pl-4 pr-4">
                            <RangeSlider
                                minPrice={0}
                                maxPrice={200000}
                                initialRange={filters.priceRange}
                                onRangeChange={(newRange: [number, number]) =>
                                    setFilters({
                                        ...filters,
                                        priceRange: newRange,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Player Count Section - Changed to segmented control */}
                    <div ref={playerCountRef} className="pt-2 pb-6">
                        <h3 className="text-lg font-medium my-2">인원</h3>
                        <div className="py-4">
                            <div className="flex w-full border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    className={`flex-1 py-3 text-center text-sm font-medium ${
                                        getPlayerType() === "none"
                                            ? "bg-orange-500 text-white"
                                            : "bg-white text-gray-700"
                                    }`}
                                    onClick={() =>
                                        handlePlayerTypeChange("none")
                                    }
                                >
                                    상관없어요
                                </button>
                                <button
                                    className={`flex-1 py-3 text-center text-sm font-medium border-l border-r border-gray-300 ${
                                        getPlayerType() === "single"
                                            ? "bg-orange-500 text-white"
                                            : "bg-white text-gray-700"
                                    }`}
                                    onClick={() =>
                                        handlePlayerTypeChange("single")
                                    }
                                >
                                    싱글 플레이어
                                </button>
                                <button
                                    className={`flex-1 py-3 text-center text-sm font-medium ${
                                        getPlayerType() === "multi"
                                            ? "bg-orange-500 text-white"
                                            : "bg-white text-gray-700"
                                    }`}
                                    onClick={() =>
                                        handlePlayerTypeChange("multi")
                                    }
                                >
                                    멀티 플레이어
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Current Player Count Section - Changed to radio buttons */}
                    <div ref={currentPlayerRef} className="pt-2 pb-6">
                        <h3 className="text-lg font-medium my-2">동접자</h3>
                        <div className="py-4">
                            <div className="grid grid-cols-2 gap-3">
                                {concurrentPlayerOptions.map(
                                    (option, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center"
                                        >
                                            <div
                                                className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 cursor-pointer ${
                                                    isPlayerRangeSelected(
                                                        option.value
                                                    )
                                                        ? "bg-orange-500 border-orange-500"
                                                        : "border-gray-300"
                                                }`}
                                                onClick={() =>
                                                    handleConcurrentPlayerChange(
                                                        option.value
                                                    )
                                                }
                                            >
                                                {isPlayerRangeSelected(
                                                    option.value
                                                ) && (
                                                    <div className="w-3 h-3 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <label
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    handleConcurrentPlayerChange(
                                                        option.value
                                                    )
                                                }
                                            >
                                                {option.label}
                                            </label>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Buttons - Now includes Reset button */}
                <div className="sticky bottom-0 bg-white pt-2 pb-2 flex justify-between">
                    {/* Left side - Reset button */}
                    <button
                        className={`px-6 py-2 rounded-full ${
                            hasActiveFilters()
                                ? "text-orange-500"
                                : "text-gray-400"
                        }`}
                        onClick={handleReset}
                        disabled={!hasActiveFilters()}
                    >
                        초기화
                    </button>

                    {/* Right side - Cancel and Apply buttons */}
                    <div className="flex space-x-3">
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
                </div>
            </div>

            {/* Toast Message Container */}
            <div className="h-16 mb-4 z-10">
                {showToast && (
                    <ToastMessage message="카테고리는 5개까지 선택할 수 있어요." />
                )}
            </div>
        </div>
    );
};

export default FilterModal;
