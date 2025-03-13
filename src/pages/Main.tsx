import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

interface Game {
    id: string;
    title: string;
    thumbnailUrl: string;
    discountRate?: number;
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

    // 항상 1개씩만 이동하도록 수정
    const stepSize = 1;
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
                                {/* Placeholder for game thumbnails */}
                                <div className="w-full h-full">
                                    {/* In a real app, you would use an image here */}
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                        {game.title}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation arrows - only shown on hover */}
                {showControls && currentIndex > 0 && (
                    <button
                        onClick={handlePrev}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2"
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
                        className="absolute right-0 top-1/2 transform -translate-y-1/2"
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

const MainPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const navigate = useNavigate();

    // Mock data for featured games
    const discountedGames: Game[] = Array.from({ length: 10 }, (_, i) => ({
        id: `game-${i + 1}`,
        title: `Game ${i + 1}`,
        thumbnailUrl: `/placeholder-${i + 1}.jpg`,
        discountRate: Math.floor(Math.random() * 70) + 10, // Random discount between 10-80%
    }));

    const gameCategories = [
        {
            title: "이런 게임은 어떠세요?",
            games: Array.from({ length: 8 }, (_, i) => ({
                id: `rec-game-${i + 1}`,
                title: `Recommended ${i + 1}`,
                thumbnailUrl: `/rec-${i + 1}.jpg`,
            })),
        },
        {
            title: "레이싱 장르를 선호하시는군요?",
            games: Array.from({ length: 8 }, (_, i) => ({
                id: `racing-game-${i + 1}`,
                title: `Racing ${i + 1}`,
                thumbnailUrl: `/racing-${i + 1}.jpg`,
            })),
        },
        {
            title: "점잖신 Stardew Valley와 비슷한 게임이에요",
            games: Array.from({ length: 8 }, (_, i) => ({
                id: `similar-game-${i + 1}`,
                title: `Similar ${i + 1}`,
                thumbnailUrl: `/similar-${i + 1}.jpg`,
            })),
        },
    ];

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
        // navigate(`/detail/${gameId}`);
        navigate(`/detail`);
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            <Header />

            <div className="flex-1 flex flex-col">
                {/* Search Bar */}
                <div className="p-4">
                    <form onSubmit={handleSearch}>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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

                {/* Featured Discounted Games - Single Row */}
                <div className="px-4 mb-6">
                    <GameSlider
                        games={discountedGames}
                        itemsPerView={1}
                        autoSlideInterval={5000}
                        onGameClick={handleGameClick}
                    />
                </div>

                {/* Game Category Sections */}
                <div className="flex-1 overflow-y-auto px-4 space-y-8 pb-8">
                    {gameCategories.map((category, index) => (
                        <div key={index} className="space-y-2">
                            <h2 className="text-lg font-medium">
                                {category.title}
                            </h2>
                            <GameSlider
                                games={category.games}
                                itemsPerView={2}
                                autoSlideInterval={0} // No auto-slide for category sections
                                onGameClick={handleGameClick}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainPage;
