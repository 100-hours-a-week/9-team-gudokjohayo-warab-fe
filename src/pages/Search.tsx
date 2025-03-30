import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "../components/Header";
import FilterModal, { FilterOptions } from "../components/FilterModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    searchGames,
    Game,
    convertFiltersToParams,
} from "../services/searchService";
import { getAllCategorys } from "../services/categoryService";
import ScrollToTopButton from "../components/ScrollToTopButton";

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
    const [categorys, setCategorys] = useState<
        { category_id: number; category_name: string }[]
    >([]);
    const [categorysLoading, setCategorysLoading] = useState<boolean>(true);

    // 인피니티 스크롤 관련 상태
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastGameElementRef = useRef<HTMLDivElement | null>(null);

    // Fetch categories when component mounts
    useEffect(() => {
        const fetchCategorys = async () => {
            try {
                setCategorysLoading(true);
                const categoryData = await getAllCategorys();
                setCategorys(categoryData);
            } catch (err) {
                console.error("Error fetching categorys:", err);
            } finally {
                setCategorysLoading(false);
            }
        };

        fetchCategorys();
    }, []);

    // Fetch games based on current filters and search query
    const fetchGames = useCallback(
        async (page = 0, isLoadingMore = false) => {
            try {
                if (page === 0) {
                    setLoading(true);
                    setHasMore(true);
                } else {
                    setLoadingMore(true);
                }
                setError(null);

                // Determine the mode based on which filter is active
                let mode: "discounted" | "recommended" | "default" = "default";
                if (discountFilter) mode = "discounted";
                if (recommendedFilter) mode = "recommended";

                // Convert filters to search parameters
                const searchParams = convertFiltersToParams(
                    activeFilters,
                    searchQuery,
                    mode
                );

                // Add page parameter
                searchParams.page = page;

                // Fetch games with the search parameters
                const gameResults = await searchGames(searchParams);

                // If we got fewer results than expected or none, there's no more data
                if (gameResults.length === 0) {
                    setHasMore(false);
                }

                // Update the games list
                if (isLoadingMore) {
                    setGames((prevGames) => [...prevGames, ...gameResults]);
                } else {
                    setGames(gameResults);
                }
            } catch (error) {
                console.error("Error fetching games:", error);
                setError("게임 목록을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [searchQuery, activeFilters, discountFilter, recommendedFilter]
    );

    // Setup intersection observer for infinite scrolling
    useEffect(() => {
        const options = {
            root: null, // viewport
            rootMargin: "0px",
            threshold: 0.1,
        };

        observerRef.current = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
                // Load more data when the last element is visible
                const nextPage = currentPage + 1;
                setCurrentPage(nextPage);
                fetchGames(nextPage, true);
            }
        }, options);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loading, loadingMore, currentPage, fetchGames]);

    // Attach the observer to the last game element
    useEffect(() => {
        if (lastGameElementRef.current && observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current.observe(lastGameElementRef.current);
        }
    }, [games]);

    // Initial fetch when component mounts or filters change
    useEffect(() => {
        setCurrentPage(0);
        fetchGames(0, false);
    }, [
        searchQuery,
        activeFilters,
        discountFilter,
        recommendedFilter,
        fetchGames,
    ]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchGames(0, false);
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
        setCurrentPage(0);
    };

    // Navigate to game detail page with category ID if available
    const handleGameClick = (gameId: number) => {
        navigate(`/games/${gameId}`);
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
                            {loading && currentPage === 0 ? (
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
                                        games.map((game, index) => (
                                            <div
                                                key={`${game.game_id}-${index}`}
                                                className="flex cursor-pointer"
                                                onClick={() =>
                                                    handleGameClick(
                                                        game.game_id
                                                    )
                                                }
                                                ref={
                                                    index === games.length - 1
                                                        ? lastGameElementRef
                                                        : null
                                                }
                                            >
                                                <div
                                                    className="w-40 h-24 bg-gray-200 flex-shrink-0 rounded-md bg-cover bg-center"
                                                    style={{
                                                        backgroundImage: `url(${game.thumbnail})`,
                                                    }}
                                                ></div>
                                                <div className="flex-1 ml-4 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-medium text-medium">
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

                                    {/* Loading indicator for infinite scroll */}
                                    {loadingMore && (
                                        <div className="py-4 text-center text-gray-500">
                                            더 많은 게임을 불러오는 중...
                                        </div>
                                    )}

                                    {/* End of results message */}
                                    {!hasMore && games.length > 0 && (
                                        <div className="py-4 text-center text-gray-500">
                                            모든 결과를 불러왔습니다.
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
                categories={categorys}
                categoriesLoading={categorysLoading}
            />

            {/* Scroll To Top Button */}
            <ScrollToTopButton
                threshold={300}
                bottom={20}
                right={20}
                backgroundColor="#FF6B00"
                size={36} // 모바일에 적합한 크기로 약간 줄임
                containerWidth={402} // 컨테이너 너비 전달
            />
        </div>
    );
};

export default SearchPage;
