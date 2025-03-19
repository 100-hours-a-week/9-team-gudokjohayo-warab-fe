import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import FilterModal, { FilterOptions } from "../components/FilterModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    searchGames,
    Game,
    convertFiltersToParams,
} from "../services/searchService";
import { getAllCategories } from "../services/categoryService";

const SearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState<string>(
        searchParams.get("query") || ""
    );
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [discountFilter, setDiscountFilter] = useState<boolean>(false);
    const [recommendedFilter, setRecommendedFilter] = useState<boolean>(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
    const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(
        null
    );
    const [categories, setCategories] = useState<
        { id: number; name: string }[]
    >([]);
    const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);

    // Fetch categories when component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const categoryData = await getAllCategories();
                setCategories(categoryData);
            } catch (err) {
                console.error("Error fetching categories:", err);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Fetch games based on current filters and search query
    const fetchGames = async () => {
        try {
            setLoading(true);
            setError(null);

            // Determine the mode based on which filter is active
            let mode: "discount" | "recommended" | "default" = "default";
            if (discountFilter) mode = "discount";
            if (recommendedFilter) mode = "recommended";

            // Convert filters to search parameters
            const searchParams = convertFiltersToParams(
                activeFilters,
                searchQuery,
                mode
            );

            // Fetch games with the search parameters
            const gameResults = await searchGames(searchParams);
            setGames(gameResults);
        } catch (error) {
            console.error("Error fetching games:", error);
            setError("게임 목록을 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch games when component mounts or filters change
    useEffect(() => {
        fetchGames();
    }, [searchQuery, activeFilters, discountFilter, recommendedFilter]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchGames();
    };

    const toggleDiscountFilter = () => {
        if (recommendedFilter) {
            setRecommendedFilter(false);
        }
        setDiscountFilter(!discountFilter);
    };

    const toggleRecommendedFilter = () => {
        if (discountFilter) {
            setDiscountFilter(false);
        }
        setRecommendedFilter(!recommendedFilter);
    };

    const toggleFilterModal = () => {
        setIsFilterModalOpen(!isFilterModalOpen);
    };

    const handleApplyFilters = (filters: FilterOptions) => {
        setActiveFilters(filters);
    };

    // Navigate to game detail page with category ID if available
    const handleGameClick = (gameId: number) => {
        navigate(`/detail/${gameId}`);
    };

    // Navigate to search with category ID
    const handleCategoryClick = (categoryId: number, categoryName: string) => {
        const newFilters: FilterOptions = {
            categories: [categoryName],
            categoryIds: [categoryId],
            rating: 4,
            priceRange: [0, 100000],
            playerCount: "싱글 플레이어",
            currentPlayerCount: "0~1,000명",
        };
        setActiveFilters(newFilters);
    };

    // Format price with commas (in Korean Won)
    const formatPrice = (price: number) => {
        if (price === 0) {
            return "무료";
        }
        return `₩${price.toLocaleString()}`;
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-white">
            <div
                className="relative bg-white"
                style={{
                    width: "402px",
                    height: "auto",
                    maxWidth: "100vw",
                    minHeight: "100vh",
                }}
            >
                {/* Fixed Header */}
                <div className="sticky top-0 z-10 w-full">
                    <Header />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto">
                    <div className="flex flex-col h-full">
                        {/* Search Bar - Matching Main.tsx */}
                        <div className="p-4">
                            <form onSubmit={handleSearch}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        placeholder="게임 검색"
                                        className="w-full px-4 py-2 rounded-full bg-gray-200 focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-gray-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Search Results and Filters */}
                        <div className="px-4 pb-4">
                            {searchQuery && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">
                                        SHOWING MATCHES FOR "{searchQuery}"
                                    </p>
                                </div>
                            )}

                            {activeFilters &&
                                activeFilters.categories.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">
                                            CATEGORIES:{" "}
                                            {activeFilters.categories.join(
                                                ", "
                                            )}
                                        </p>
                                    </div>
                                )}

                            <div className="flex items-center mb-4">
                                <div className="flex space-x-2">
                                    <button
                                        className={`px-4 py-2 text-sm rounded-md border ${
                                            discountFilter
                                                ? "bg-orange-500 text-white border-orange-500"
                                                : "bg-white text-black border-gray-300"
                                        }`}
                                        onClick={toggleDiscountFilter}
                                    >
                                        할인
                                    </button>
                                    <button
                                        className={`px-4 py-2 text-sm rounded-md border ${
                                            recommendedFilter
                                                ? "bg-orange-500 text-white border-orange-500"
                                                : "bg-white text-black border-gray-300"
                                        }`}
                                        onClick={toggleRecommendedFilter}
                                    >
                                        추천
                                    </button>
                                </div>
                                <div className="ml-auto">
                                    <button
                                        className={`text-gray-500 ${
                                            activeFilters
                                                ? "text-orange-500"
                                                : ""
                                        }`}
                                        onClick={toggleFilterModal}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Game Results List */}
                        <div className="flex-1 overflow-y-auto px-4">
                            {loading ? (
                                <div className="py-8 text-center text-gray-500">
                                    게임을 불러오는 중입니다...
                                </div>
                            ) : error ? (
                                <div className="py-8 text-center text-red-500">
                                    {error}
                                </div>
                            ) : (
                                <div className="space-y-4 pb-6">
                                    {games.length > 0 ? (
                                        games.map((game) => (
                                            <div
                                                key={game.game_id}
                                                className="flex cursor-pointer"
                                                onClick={() =>
                                                    handleGameClick(
                                                        game.game_id
                                                    )
                                                }
                                            >
                                                <div
                                                    className="w-32 h-32 bg-gray-200 flex-shrink-0 rounded-md bg-cover bg-center"
                                                    style={{
                                                        backgroundImage: `url(${game.thumbnail})`,
                                                    }}
                                                ></div>
                                                <div className="flex-1 ml-4 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-medium text-lg">
                                                            {game.title}
                                                        </h3>
                                                    </div>
                                                    <div className="self-end">
                                                        {game.lowest_price <
                                                        game.price ? (
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-orange-500 font-medium">
                                                                    {formatPrice(
                                                                        game.lowest_price
                                                                    )}
                                                                </span>
                                                                <span className="text-gray-500 line-through text-sm">
                                                                    {formatPrice(
                                                                        game.price
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-right font-medium">
                                                                {formatPrice(
                                                                    game.price
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            해당 검색결과가 없습니다.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Modal */}
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={toggleFilterModal}
                onApply={handleApplyFilters}
                initialFilters={activeFilters || undefined}
                categories={categories}
                categoriesLoading={categoriesLoading}
            />
        </div>
    );
};

export default SearchPage;
