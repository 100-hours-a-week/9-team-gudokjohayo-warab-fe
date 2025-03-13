import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import FilterModal, { FilterOptions } from "../components/FilterModal";
import { useNavigate } from "react-router-dom"; // Import for navigation

interface Game {
    id: string;
    title: string;
    price: number;
    discountedPrice?: number;
    imageUrl: string;
    categories?: string[];
    rating?: number;
    playerCount?: number;
    currentPlayers?: number;
}

interface SearchPageProps {
    // Add any props if needed
}

const SearchPage: React.FC<SearchPageProps> = () => {
    const navigate = useNavigate(); // Initialize navigate hook
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [games, setGames] = useState<Game[]>([]);
    const [discountFilter, setDiscountFilter] = useState<boolean>(false);
    const [recommendedFilter, setRecommendedFilter] = useState<boolean>(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
    const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(
        null
    );

    // Mock data for games
    useEffect(() => {
        // This would normally come from an API
        const mockGames: Game[] = [
            {
                id: "stardew-valley",
                title: "Stardew Valley",
                price: 16000,
                imageUrl: "/game-placeholder.jpg",
                categories: ["시뮬레이션", "힐링", "캐주얼"],
                rating: 5,
                playerCount: 4,
                currentPlayers: 500000,
            },
            {
                id: "balatro",
                title: "Balatro",
                price: 16500,
                discountedPrice: 14020,
                imageUrl: "/game-placeholder.jpg",
                categories: ["카드", "전략"],
                rating: 4,
                playerCount: 1,
                currentPlayers: 75000,
            },
            {
                id: "cyberpunk-2077",
                title: "Cyberfunk 2077",
                price: 66000,
                imageUrl: "/game-placeholder.jpg",
                categories: ["오픈 월드", "액션", "어드벤처"],
                rating: 4,
                playerCount: 1,
                currentPlayers: 150000,
            },
            {
                id: "hogwarts-legacy",
                title: "Hogwarts Legacy",
                price: 79800,
                imageUrl: "/game-placeholder.jpg",
                categories: ["어드벤처", "오픈 월드", "액션"],
                rating: 4,
                playerCount: 1,
                currentPlayers: 90000,
            },
            {
                id: "dave-driver",
                title: "Dave the Driver",
                price: 24000,
                imageUrl: "/game-placeholder.jpg",
                categories: ["시뮬레이션", "캐주얼"],
                rating: 3,
                playerCount: 1,
                currentPlayers: 5000,
            },
            {
                id: "gta-v",
                title: "Grand Theft Auto V",
                price: 33000,
                imageUrl: "/game-placeholder.jpg",
                categories: ["오픈 월드", "액션", "온라인 멀티"],
                rating: 5,
                playerCount: 30,
                currentPlayers: 1000000,
            },
        ];

        setGames(mockGames);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would trigger a search API call
        console.log(`Searching for: ${searchQuery}`);
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
        console.log("Applied filters:", filters);
    };

    // Navigate to game detail page
    const handleGameClick = (gameId: string) => {
        // Navigate to the detail page with the game ID
        navigate(`/detail/`);
        // navigate(`/detail/${gameId}`);
    };

    // Function to parse player count range
    const parsePlayerCountRange = (range: string): [number, number] => {
        const numbers = range.replace(/[^0-9~]/g, "").split("~");
        const start = parseInt(numbers[0]) || 0;
        const end = numbers[1] ? parseInt(numbers[1]) : Number.MAX_SAFE_INTEGER;
        return [start, end];
    };

    // Filter games based on search query, active filters, and other filter buttons
    const filteredGames = games.filter((game) => {
        const matchesSearch = game.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        let matchesDiscountFilter = true;
        if (discountFilter) {
            matchesDiscountFilter = game.discountedPrice !== undefined;
        }

        // In a real app, you would implement recommendation logic
        let matchesRecommendedFilter = true;
        if (recommendedFilter) {
            // For this demo, we'll consider games with rating >= 4 as recommended
            matchesRecommendedFilter = (game.rating || 0) >= 4;
        }

        // Check if game matches active filters
        let matchesActiveFilters = true;
        if (activeFilters) {
            // Filter by categories if any selected
            if (activeFilters.categories.length > 0) {
                matchesActiveFilters = activeFilters.categories.some(
                    (category) => game.categories?.includes(category)
                );
            }

            // Filter by rating
            if (matchesActiveFilters && game.rating !== undefined) {
                matchesActiveFilters = game.rating >= activeFilters.rating;
            }

            // Filter by price range
            if (matchesActiveFilters) {
                const [minPrice, maxPrice] = activeFilters.priceRange;
                const gamePrice =
                    game.discountedPrice !== undefined
                        ? game.discountedPrice
                        : game.price;
                matchesActiveFilters =
                    gamePrice >= minPrice && gamePrice <= maxPrice;
            }

            // Filter by player count
            if (matchesActiveFilters && game.playerCount !== undefined) {
                matchesActiveFilters =
                    game.playerCount >= activeFilters.playerCount;
            }

            // Filter by current player count
            if (matchesActiveFilters && game.currentPlayers !== undefined) {
                const [minPlayers, maxPlayers] = parsePlayerCountRange(
                    activeFilters.currentPlayerCount
                );
                matchesActiveFilters =
                    game.currentPlayers >= minPlayers &&
                    game.currentPlayers <= maxPlayers;
            }
        }

        return (
            matchesSearch &&
            matchesDiscountFilter &&
            matchesRecommendedFilter &&
            matchesActiveFilters
        );
    });

    // Format price with commas
    const formatPrice = (price: number) => {
        return `₩${price.toLocaleString()}`;
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            <Header />

            <div className="flex-1 flex flex-col">
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
                                    activeFilters ? "text-orange-500" : ""
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
                    <div className="space-y-4 pb-6">
                        {filteredGames.length > 0 ? (
                            filteredGames.map((game) => (
                                <div
                                    key={game.id}
                                    className="flex cursor-pointer"
                                    onClick={() => handleGameClick(game.id)}
                                >
                                    <div className="w-32 h-32 bg-gray-200 flex-shrink-0 rounded-md"></div>
                                    <div className="flex-1 ml-4 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-medium text-lg">
                                                {game.title}
                                            </h3>
                                            {game.categories && (
                                                <div className="flex flex-wrap mt-1">
                                                    {game.categories
                                                        .slice(0, 3)
                                                        .map(
                                                            (category, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md mr-1 mb-1"
                                                                >
                                                                    {category}
                                                                </span>
                                                            )
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="self-end">
                                            {game.discountedPrice ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-orange-500 font-medium">
                                                        {formatPrice(
                                                            game.discountedPrice
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
                                                    {formatPrice(game.price)}
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
                </div>
            </div>

            {/* Filter Modal */}
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={toggleFilterModal}
                onApply={handleApplyFilters}
                initialFilters={activeFilters || undefined}
            />
        </div>
    );
};

export default SearchPage;
