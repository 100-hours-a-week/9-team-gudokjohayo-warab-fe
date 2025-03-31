import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import api from "../api/config";
import { getUserProfile } from "../services/userService";

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
    const [mainPageSections, setMainPageSections] = useState<MainPageSection[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showCategoryBanner, setShowCategoryBanner] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 메인 페이지 데이터 가져오기
                const response = await api.get<MainPageResponse>("/games/main");
                if (response.data.message === "main_page_inquiry_success") {
                    setMainPageSections(response.data.data.games);
                }

                // 유저 프로필 데이터 가져오기
                const profileData = await getUserProfile();
                // 프로필 페이지에서 선호 카테고리를 등록하지 않은 경우에만 배너 표시
                setShowCategoryBanner(
                    !profileData.data.categorys || profileData.data.categorys.length === 0
                );
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

    const handleCategoryRegister = () => {
        navigate('/profile');
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-white">
            <div className="relative bg-white" style={{ width: "402px", height: "auto", maxWidth: "100vw", minHeight: "100vh" }}>
                {/* Fixed Header */}
                <div className="sticky top-0 z-10 w-full">
                    <Header />
                </div>

                {/* Scrollable Content */}
                <div className="px-4 pb-4">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mt-4 mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="게임 검색하기"
                                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-orange-500"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
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

                    {/* Category Registration Banner - Only shown when user hasn't registered categories */}
                    {showCategoryBanner && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg border border-orange-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            {/* 아이콘 제거됨 */}
                            <div className="flex-1">
                                <h3 className="text-md font-semibold text-gray-800 mb-1">
                                    나만의 게임 취향을 설정해보세요
                                </h3>
                                <p className="text-sm text-gray-600">
                                    선호하는 카테고리를 등록하면 맞춤형 게임 추천을 받을 수 있어요
                                </p>
                            </div>
                            <button
                                onClick={handleCategoryRegister}
                                className="flex-shrink-0 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors duration-300 flex items-center gap-1 shadow-sm"
                            >
                                <span>설정하기</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}                                      


                    {/* Game Sections */}
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <p className="text-gray-500">게임 정보를 불러오는 중...</p>
                        </div>
                    ) : (
                        mainPageSections.map((section, index) => (
                            <div key={index} className="mb-8">
                                <GameSlider
                                    games={section.games}
                                    itemsPerView={2}
                                    title={section.title}
                                    onGameClick={handleGameClick}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainPage;
