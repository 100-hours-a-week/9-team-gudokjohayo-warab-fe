import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "../components/Header";
import FilterModal, { FilterOptions } from "../components/FilterModal";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
    searchGames,
    Game,
    convertFiltersToParams,
} from "../services/searchService";
import { getUserProfile } from "../services/userService";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { safeRequest } from "../sentry/errorHandler";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { fetchCategories } from "../redux/categorySlice";

// 디바운스 함수 추가
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// 스켈레톤 로딩 컴포넌트
const GameSkeleton: React.FC = () => {
    return (
        <div className="flex animate-pulse">
            <div className="w-40 h-24 bg-gray-300 flex-shrink-0 rounded-md"></div>
            <div className="flex-1 ml-4 flex flex-col justify-between">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="self-end">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
            </div>
        </div>
    );
};

const SearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const isInitialMount = useRef(true);
    const hasUserInteracted = useRef(false);
    const hasProcessedFromMain = useRef(false);

    // Modify the initializeStateFromStorage function
    const initializeStateFromStorage = () => {
        // Check if there's a 'from' parameter to identify navigation source
        const fromParam = searchParams.get("from");
        const queryParam = searchParams.get("query");
        const savedState = sessionStorage.getItem("searchPageState");

        // If coming from main page, prioritize the query parameter but otherwise reset filters
        const isFromMainPage = fromParam === "main";

        // If we're coming from main page and it's the first render
        if (isFromMainPage && !hasProcessedFromMain.current) {
            hasProcessedFromMain.current = true;
            return {
                // Use the query parameter if it exists, otherwise empty string
                query: queryParam || "",
                activeFilters: null,
                discount: false,
                recommended: false,
            };
        }

        // Otherwise check for saved state or URL parameters
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            return {
                query: queryParam || parsedState.searchQuery || "",
                activeFilters: parsedState.activeFilters,
                discount: parsedState.discountFilter || false,
                recommended: parsedState.recommendedFilter || false,
            };
        }

        // No saved state, use URL or empty defaults
        return {
            query: queryParam || "",
            activeFilters: null,
            discount: searchParams.get("discount") === "true",
            recommended: searchParams.get("recommended") === "true",
        };
    };

    const { categories, isLoading: categorysLoading } = useAppSelector(
        (state) => state.category
    );
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (categories.length === 0 && !categorysLoading) {
            dispatch(fetchCategories());
        }
    }, [categories.length, categorysLoading, dispatch]);

    const initialState = initializeStateFromStorage();

    const [searchQuery, setSearchQuery] = useState<string>(initialState.query);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [discountFilter, setDiscountFilter] = useState<boolean>(
        initialState.discount
    );
    const [recommendedFilter, setRecommendedFilter] = useState<boolean>(
        initialState.recommended
    );
    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
    const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(
        initialState.activeFilters
    );

    // 새로운 상태: 결과가 있는지 여부 추적
    const [hasResults, setHasResults] = useState<boolean>(true);

    // 인피니티 스크롤 관련 상태
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastGameElementRef = useRef<HTMLDivElement | null>(null);
    const pendingSearchRef = useRef<boolean>(false);

    // 디바운스된 검색어 (타이핑 중지 후 300ms 기다림)
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const [hasPreferredCategories, setHasPreferredCategories] =
        useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

    // 사용자의 선호 카테고리 설정 여부 확인
    useEffect(() => {
        const checkUserPreferences = async () => {
            try {
                const userProfile = await safeRequest(
                    () => getUserProfile(),
                    "SearchPage - getUserProfile"
                );

                if (
                    userProfile &&
                    userProfile.data &&
                    userProfile.data.categorys
                ) {
                    setHasPreferredCategories(
                        userProfile.data.categorys.length > 0
                    );
                }

                setIsAuthenticated(true);
            } catch (error) {
                console.error("Error fetching user preferences:", error);
                setHasPreferredCategories(false);
                setIsAuthenticated(false);
            }
        };

        checkUserPreferences();
    }, []);

    // 현재 활성화된 요청에 대한 AbortController 참조 추가
    const abortControllerRef = useRef<AbortController | null>(null);

    const updateUrlWithoutPushingHistory = useCallback(() => {
        const newParams = new URLSearchParams(searchParams);

        // from=main 파라미터 제거 (사용자 상호작용 발생 시)
        if (hasUserInteracted.current) {
            newParams.delete("from");
        }

        // 기존 파라미터 제거
        newParams.delete("discount");
        newParams.delete("recommended");

        // 필요한 파라미터만 추가
        if (searchQuery) newParams.set("query", searchQuery);
        if (discountFilter) newParams.set("discount", "true");
        if (recommendedFilter) newParams.set("recommended", "true");

        // replaceState를 사용하여 현재 URL 업데이트 (히스토리에 추가하지 않음)
        navigate(`?${newParams.toString()}`, { replace: true });
    }, [
        searchParams,
        searchQuery,
        discountFilter,
        recommendedFilter,
        navigate,
    ]);

    // Save state to sessionStorage but with a debounce effect
    useEffect(() => {
        // Skip on initial mount to prevent double fetching
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const stateToSave = {
            searchQuery,
            activeFilters,
            discountFilter,
            recommendedFilter,
        };
        sessionStorage.setItem("searchPageState", JSON.stringify(stateToSave));

        // Only update URL params when explicitly performing a search
        if (pendingSearchRef.current) {
            updateUrlWithoutPushingHistory();
            pendingSearchRef.current = false;
        }
    }, [
        searchQuery,
        activeFilters,
        discountFilter,
        recommendedFilter,
        updateUrlWithoutPushingHistory,
    ]);

    // Fetch games 함수 수정
    const fetchGames = useCallback(
        async (page = 0, isLoadingMore = false) => {
            try {
                // 검색 실행 시 사용자 상호작용 플래그 설정
                hasUserInteracted.current = true;

                // 이전 요청이 있다면 중단
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }

                // 새 AbortController 생성
                abortControllerRef.current = new AbortController();
                const signal = abortControllerRef.current.signal;

                if (page === 0) {
                    // 처음 로딩할 때만 로딩 상태 변경, 기존 결과는 유지
                    setLoading(true);
                    // 기존 결과가 계속 보이도록 유지
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
                    debouncedSearchQuery, // 디바운스된 검색어 사용
                    mode
                );

                // Add page parameter
                searchParams.page = page;

                const gameResults = await safeRequest(
                    () => searchGames(searchParams, signal),
                    "SearchPage - searchGames",
                    {
                        page: String(page),
                        query: debouncedSearchQuery,
                    }
                );

                // 이미 중단된 요청에 대한 응답이면 처리하지 않음
                if (signal.aborted) return;

                // If we got fewer results than expected or none, there's no more data
                if (gameResults && Array.isArray(gameResults)) {
                    setHasResults(gameResults.length > 0);
                    if (gameResults.length === 0) {
                        setHasMore(false);
                    }
                    // Update the games list with fade transition
                    if (isLoadingMore) {
                        setGames((prevGames) => [...prevGames, ...gameResults]);
                    } else {
                        setGames(gameResults);
                    }
                }
            } catch (error: unknown) {
                // 중단된 요청에 대한 에러는 무시
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    console.log("요청이 중단되었습니다.");
                    return;
                }

                console.error("Error fetching games:", error);
                setError("게임 목록을 불러오는 데 실패했습니다.");
            } finally {
                // 중단된 요청이 아닌 경우에만 로딩 상태 업데이트
                if (
                    abortControllerRef.current &&
                    !abortControllerRef.current.signal.aborted
                ) {
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        },
        [debouncedSearchQuery, activeFilters, discountFilter, recommendedFilter]
    );

    // 컴포넌트 언마운트 시 모든 요청 중단
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

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

    // Initial data fetch when URL parameters change
    useEffect(() => {
        const fromParam = searchParams.get("from");
        const queryParam = searchParams.get("query");
        const isFromMainPage = fromParam === "main";

        const shouldFetch =
            // Either it's the initial load with query params
            (!isInitialMount.current && location.search.includes("query")) ||
            // Or it's the first load with saved state
            (isInitialMount.current && initialState.query) ||
            // Or there's a query parameter present (even from main page)
            queryParam ||
            // Or there's no query but we're not coming from the main page
            (!isInitialMount.current && !isFromMainPage);

        if (shouldFetch) {
            setCurrentPage(0);
            fetchGames(0, false);
        }

        isInitialMount.current = false;
    }, [location.search, fetchGames, searchParams, initialState.query]);

    // 디바운스된 검색어가 변경될 때마다 검색 실행
    useEffect(() => {
        if (
            debouncedSearchQuery !== initialState.query ||
            !isInitialMount.current
        ) {
            pendingSearchRef.current = true;
            setCurrentPage(0);
            fetchGames(0, false);
        }
    }, [debouncedSearchQuery, fetchGames, initialState.query]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        // 사용자가 검색어 입력 시 상호작용 플래그 설정
        hasUserInteracted.current = true;
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // 사용자가 직접 검색 버튼 클릭 시 상호작용 플래그 설정
        hasUserInteracted.current = true;
        pendingSearchRef.current = true;
        setCurrentPage(0);
        fetchGames(0, false);
    };

    const toggleDiscountFilter = () => {
        // 필터 버튼 클릭 시 사용자 상호작용 플래그 설정
        hasUserInteracted.current = true;

        if (recommendedFilter) {
            setRecommendedFilter(false);
        }
        setDiscountFilter(!discountFilter);
        pendingSearchRef.current = true;
        setCurrentPage(0);

        // URL 업데이트 시 replaceState 사용
        updateUrlWithoutPushingHistory();

        fetchGames(0, false);
    };

    const toggleRecommendedFilter = () => {
        // 필터 버튼 클릭 시 사용자 상호작용 플래그 설정
        hasUserInteracted.current = true;

        if (discountFilter) {
            setDiscountFilter(false);
        }
        setRecommendedFilter(!recommendedFilter);
        pendingSearchRef.current = true;
        setCurrentPage(0);

        // URL 업데이트 시 replaceState 사용
        updateUrlWithoutPushingHistory();

        fetchGames(0, false);
    };

    const toggleFilterModal = () => {
        // 필터 모달 열기/닫기 시 사용자 상호작용 플래그 설정
        hasUserInteracted.current = true;
        setIsFilterModalOpen(!isFilterModalOpen);
    };

    const handleApplyFilters = (filters: FilterOptions) => {
        // 필터 적용 시 사용자 상호작용 플래그 설정
        hasUserInteracted.current = true;
        setActiveFilters(filters);
        pendingSearchRef.current = true;
        setCurrentPage(0);
        fetchGames(0, false);
    };

    // Handle the reset functionality from FilterModal
    const handleResetFilters = () => {
        // 필터 초기화 시 사용자 상호작용 플래그 설정
        hasUserInteracted.current = true;
        setActiveFilters(null);
        pendingSearchRef.current = true;
        setCurrentPage(0);
        fetchGames(0, false);
    };

    // Update handleGameClick to save state before navigation
    const handleGameClick = (gameId: number) => {
        // 게임 클릭 시 항상 현재 상태 저장
        const stateToSave = {
            searchQuery: searchQuery, // Use current input value, not debounced one
            activeFilters,
            discountFilter,
            recommendedFilter,
        };
        sessionStorage.setItem("searchPageState", JSON.stringify(stateToSave));

        // Then navigate
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
                                        maxLength={100}
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
                                activeFilters.categories?.length > 0 && (
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
                            {loading &&
                            currentPage === 0 &&
                            games.length === 0 ? (
                                // 스켈레톤 로딩 UI
                                <div className="space-y-4 pb-6">
                                    {[...Array(5)].map((_, index) => (
                                        <GameSkeleton
                                            key={`skeleton-${index}`}
                                        />
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="py-8 text-center text-red-500">
                                    {error}
                                </div>
                            ) : (
                                <div className="space-y-4 pb-6">
                                    {/* 기존 결과가 있을 때는 계속 보여주면서 바뀌도록 함 */}
                                    {games.length > 0 ? (
                                        <div className="transition-opacity duration-300">
                                            {games.map((game, index) => (
                                                <div
                                                    key={`${game.game_id}-${index}`}
                                                    className="flex cursor-pointer mb-4"
                                                    onClick={() =>
                                                        handleGameClick(
                                                            game.game_id
                                                        )
                                                    }
                                                    ref={
                                                        index ===
                                                        games.length - 1
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
                                            ))}
                                        </div>
                                    ) : !loading && hasResults === false ? (
                                        <div className="py-8 text-center text-gray-500">
                                            {recommendedFilter &&
                                            (!isAuthenticated ||
                                                !hasPreferredCategories)
                                                ? "선호 카테고리를 설정해주세요."
                                                : "해당 검색결과가 없습니다."}
                                        </div>
                                    ) : null}

                                    {/* 추가 로딩 인디케이터 - 무한 스크롤 */}
                                    {loadingMore && (
                                        <div className="space-y-4 pb-6">
                                            {[...Array(2)].map((_, index) => (
                                                <GameSkeleton
                                                    key={`loading-more-${index}`}
                                                />
                                            ))}
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
                onReset={handleResetFilters}
                initialFilters={activeFilters || undefined}
                categories={categories}
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
