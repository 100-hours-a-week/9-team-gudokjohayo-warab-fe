import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import api from "../api/config";

interface Game {
    game_id: number;
    title: string;
    thumbnail: string;
    price: number;
    lowest_price: number;
}

interface MainPageSection {
    title: string;
    games: Game[];
}

interface MainPageResponse {
    message: string;
    data: {
        games: MainPageSection[];
    };
}

interface GameSliderProps {
    games: Game[];
    itemsPerView: number;
    autoSlideInterval?: number;
    title?: string;
    subtitle?: string;
    onGameClick: (gameId: number) => void;
}

const GameSlider: React.FC<GameSliderProps> = ({
    games,
    itemsPerView,
    autoSlideInterval = 5000,
    title,
    subtitle,
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
                setCurrentIndex((prevIndex) =>
                    prevIndex >= maxIndex ? 0 : prevIndex + 1
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
            const newIndex = prevIndex + 1;
            return newIndex > maxIndex ? maxIndex : newIndex;
        });
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex - 1;
            return newIndex < 0 ? 0 : newIndex;
        });
    };

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

    const calculateDiscountRate = (game: Game) => {
        if (game.price > game.lowest_price) {
            return Math.round(
                ((game.price - game.lowest_price) / game.price) * 100
            );
        }
        return 0;
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            ref={sliderRef}
        >
            {(title || subtitle) && (
                <div className="mb-2">
                    {title && <h2 className="text-lg font-medium">{title}</h2>}
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                </div>
            )}
            <div
                className="relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / games.length)}%)`,
                        width: `${(games.length / itemsPerView) * 100}%`,
                    }}
                >
                    {games.map((game) => (
                        <div
                            key={game.game_id}
                            className="flex-shrink-0 cursor-pointer"
                            style={{ width: `${100 / games.length}%` }}
                            onClick={() => onGameClick(game.game_id)}
                        >
                            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-md overflow-hidden mx-1 relative">
                                <img
                                    src={game.thumbnail}
                                    alt={`${game.title} thumbnail`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "/default-game-image.jpg";
                                    }}
                                />
                                {calculateDiscountRate(game) > 0 && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold p-1 m-1 rounded">
                                        {calculateDiscountRate(game)}% OFF
                                    </div>
                                )}
                            </div>
                            <div className="mt-1 px-1 truncate text-sm font-medium">
                                {game.title}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation arrows */}
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

const MainPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [mainPageSections, setMainPageSections] = useState<MainPageSection[]>(
        []
    );
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMainPageData = async () => {
            setLoading(true);
            try {
                const response = await api.get<MainPageResponse>("/games/main");

                if (response.data.message === "main_page_inquiry_success") {
                    console.log(response.data.data.games);
                    setMainPageSections(response.data.data.games);
                } else {
                    throw new Error("Failed to fetch main page data");
                }
            } catch (error) {
                console.error("Error fetching main page data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMainPageData();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        } else {
            navigate("/search");
        }
    };

    const handleGameClick = (gameId: number) => {
        navigate(`/games/${gameId}`);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div
                className="relative bg-white"
                style={{
                    width: "402px",
                    height: "auto",
                    maxWidth: "100vw",
                    minHeight: "100vh",
                }}
            >
                <div className="sticky top-0 z-10">
                    <Header />
                </div>

                <div className="flex flex-col">
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
                        <div className="px-4 space-y-8 pb-8">
                            {mainPageSections.map((section, index) => (
                                <div key={index} className="space-y-2">
                                    <GameSlider
                                        games={section.games}
                                        itemsPerView={index === 0 ? 1 : 2}
                                        autoSlideInterval={
                                            index === 0 ? 5000 : 0
                                        }
                                        title={section.title}
                                        onGameClick={handleGameClick}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainPage;
