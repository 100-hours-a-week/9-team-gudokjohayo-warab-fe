import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import {
    searchGames,
    Game as ApiGame,
    convertFiltersToParams,
} from "../services/searchService";
// hazel: gameCategoriesData import 주석 처리 
// import gameCategoriesData from "../data/gameCategories.json";

interface Game {
    id: string;
    title: string;
    thumbnailUrl: string;
    discountRate?: number;
    price?: number;
    lowestPrice?: number;
}

interface GameCategory {
    id: number;
    title: string;
    games: Game[];
}

interface GameSliderProps {
    games: Game[];
    itemsPerView: number;
    autoSlideInterval?: number;
    title?: string;
    onGameClick: (gameId: string) => void;
}

const GameSlider: React.FC<GameSliderProps> = ({
    games,
    itemsPerView,
    autoSlideInterval = 5000,
    title,
    onGameClick,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const maxIndex = Math.max(0, games.length - itemsPerView);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (autoSlideInterval > 0) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex(
                    (prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1) // 항상 1개씩만 이동
                );
            }, autoSlideInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [maxIndex, autoSlideInterval]);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex + 1; // 항상 1개씩만 이동
            return newIndex > maxIndex ? maxIndex : newIndex;
        });
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex - 1; // 항상 1개씩만 이동
            return newIndex < 0 ? 0 : newIndex;
        });
    };

    // Handle touch events for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && currentIndex < maxIndex) {
            handleNext();
        }

        if (isRightSwipe && currentIndex > 0) {
            handlePrev();
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            ref={sliderRef}
        >
            {title && <h2 className="text-lg font-medium mb-2">{title}</h2>}
            <div
                className="relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / games.length)}%)`, // 개별 아이템 너비에 맞게 이동하도록 수정
                        width: `${(games.length / itemsPerView) * 100}%`,
                    }}
                >
                    {games.map((game) => (
                        <div
                            key={game.id}
                            className="flex-shrink-0 cursor-pointer"
                            style={{ width: `${100 / games.length}%` }}
                            onClick={() => onGameClick(game.id)}
                        >
                            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-md overflow-hidden mx-1">
                                {/* 게임 썸네일 이미지 추가 */}
                                <img
                                    src={game.thumbnailUrl}
                                    alt={`${game.title} thumbnail`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // 이미지 로드 실패 시 기본 이미지로 대체
                                        (e.target as HTMLImageElement).src =
                                            "/default-game-image.jpg";
                                    }}
                                />
                                {/* 할인율 표시 (있는 경우) */}
                                {game.discountRate && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold p-1 m-1 rounded">
                                        {game.discountRate}% OFF
                                    </div>
                                )}
                            </div>
                            {/* 게임 제목 */}
                            <div className="mt-1 px-1 truncate text-sm font-medium">
                                {game.title}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation arrows - only shown on hover */}
                {showControls && currentIndex > 0 && (
                    <button
                        onClick={handlePrev}
                        className="absolute left-0 top-[calc(50%-1rem)] transform -translate-y-1/2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-white drop-shadow-lg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                )}

                {showControls && currentIndex < maxIndex && (
                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-[calc(50%-1rem)] transform -translate-y-1/2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-white drop-shadow-lg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {/* Pagination indicators */}
            <div className="flex justify-center mt-2">
                {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1.5 mx-0.5 rounded-full transition-all ${
                            i === currentIndex
                                ? "w-4 bg-orange-500"
                                : "w-1.5 bg-gray-300"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

// Function to convert API game format to component format
const convertApiGameToComponentGame = (apiGame: ApiGame): Game => {
    // Calculate discount rate if applicable
    let discountRate = undefined;
    if (apiGame.price > apiGame.lowest_price) {
        discountRate = Math.round(
            ((apiGame.price - apiGame.lowest_price) / apiGame.price) * 100
        );
    }

    return {
        id: apiGame.game_id.toString(),
        title: apiGame.title,
        thumbnailUrl: apiGame.thumbnail,
        discountRate,
        price: apiGame.price,
        lowestPrice: apiGame.lowest_price,
    };
};

const MainPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [discountedGames, setDiscountedGames] = useState<Game[]>([]);
    const [gameCategories, setGameCategories] = useState<GameCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    // Define categories
    const categories = [
        { id: 1, title: "액션" },
        { id: 2, title: "어드벤처" },
        { id: 3, title: "RPG" },
        { id: 4, title: "전략" },
        { id: 5, title: "시뮬레이션" },
    ];

    // hazel: 의존성 배열에 categories 추가 
    useEffect(() => {
        const fetchGames = async () => {
            setLoading(true);
            try {
                // Fetch discounted games
                const discountParams = convertFiltersToParams(
                    {},
                    "",
                    "discount"
                );
                const discountedApiGames = await searchGames(discountParams);
                const formattedDiscountedGames = discountedApiGames.map(
                    convertApiGameToComponentGame
                );
                setDiscountedGames(formattedDiscountedGames);

                // Fetch games for each category
                const categoryPromises = categories.map(async (category) => {
                    const categoryParams = convertFiltersToParams({
                        categoryIds: [category.id],
                    });
                    const categoryGames = await searchGames(categoryParams);
                    return {
                        id: category.id,
                        title: category.title,
                        games: categoryGames.map(convertApiGameToComponentGame),
                    };
                });

                const fetchedCategories = await Promise.all(categoryPromises);
                setGameCategories(fetchedCategories);
            } catch (error) {
                console.error("Error fetching games:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, [categories]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Navigate to search page with query parameter
        if (searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        } else {
            navigate("/search");
        }
    };

    const handleGameClick = (gameId: string) => {
        // Navigate to game detail page
        navigate(`/detail/${gameId}`);
    };

    const handleCategoryMoreClick = (
        categoryId: number,
        categoryTitle: string
    ) => {
        // Navigate to search page with category as filter
        navigate(`/search?category_ids=${categoryId}`);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            {/* 고정 비율 컨테이너 (402*874) */}
            <div
                className="relative bg-white"
                style={{
                    width: "402px",
                    height: "auto", // 높이를 자동으로 조정하여 스크롤 가능하게 함
                    maxWidth: "100vw",
                    minHeight: "100vh", // 최소 높이를 뷰포트 높이로 설정
                }}
            >
                {/* 헤더 고정 */}
                <div className="sticky top-0 z-10">
                    <Header />
                </div>

                <div className="flex flex-col">
                    {/* Search Bar */}
                    <div className="p-4">
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
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

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* Featured Discounted Games - Single Row */}
                            <div className="px-4 mb-6">
                                <div className="mb-2">
                                    <h2 className="text-lg font-medium">
                                        특가 할인 게임
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        지금 가장 좋은 가격에 만나보세요
                                    </p>
                                </div>
                                <GameSlider
                                    games={discountedGames}
                                    itemsPerView={1}
                                    autoSlideInterval={5000}
                                    onGameClick={handleGameClick}
                                />
                            </div>

                            {/* Game Category Sections */}
                            <div className="px-4 space-y-8 pb-8">
                                {gameCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="space-y-2"
                                    >
                                        {/* Category title with "더보기" button */}
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h2 className="text-lg font-medium">
                                                    {category.title}
                                                </h2>
                                                <p className="text-sm text-gray-500">
                                                    {category.title} 장르를
                                                    선호하시는군요!
                                                </p>
                                            </div>
                                            <button
                                                className="text-sm text-gray-500 font-medium"
                                                onClick={() =>
                                                    handleCategoryMoreClick(
                                                        category.id,
                                                        category.title
                                                    )
                                                }
                                            >
                                                더보기
                                            </button>
                                        </div>
                                        <GameSlider
                                            games={category.games}
                                            itemsPerView={2}
                                            autoSlideInterval={0} // No auto-slide for category sections
                                            onGameClick={handleGameClick}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainPage;
