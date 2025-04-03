import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import PartyFindTab from "../components/PartyFindTab";
// mvp 기능에서 제외
// import VideoTab from "../components/VideoTab";
import PriceTab from "../components/PriceTab";
import { getGameDetails } from "../services/gameService";

interface GameDetail {
    title: string;
    thumbnail: string;
    price: number;
    lowest_price: number;
    description: string;
    release_date: string;
    developer: string;
    publisher: string;
    rating: number;
    single_play: boolean;
    multi_play: boolean;
    recent_player: number;
    categories: string[];
    updated_at: string;
}

interface DetailPageProps {
    // Add any props if needed
}

const DetailPage: React.FC<DetailPageProps> = () => {
    // Game details state
    const { gameId } = useParams<{ gameId: string }>();
    const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Category state for accordion
    const [isCategoryExpanded, setIsCategoryExpanded] =
        useState<boolean>(false);

    // Tab state
    const [activeTab, setActiveTab] = useState<string>("price-comparison");

    useEffect(() => {
        const fetchGameDetails = async () => {
            try {
                setLoading(true);
                // Use the gameId from URL params, fallback to "1" if not available
                const data = await getGameDetails(gameId || "1");
                setGameDetail(data);
                setLoading(false);
            } catch (err) {
                setError("게임 정보를 불러오는 데 실패했습니다.");
                setLoading(false);
                console.error("Error fetching game details:", err);
            }
        };

        fetchGameDetails();
    }, [gameId]);

    const toggleCategoryExpansion = () => {
        setIsCategoryExpanded(!isCategoryExpanded);
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };

    const renderScore = (rating: number) => {
        const converted = (rating / 10) * 5;
        return (Math.round(converted * 10) / 10).toFixed(1);
    };

    // Render stars based on rating
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating / 2);
        const halfStar = rating % 2 >= 1 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        const stars = [];
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <span key={`full-${i}`} className="text-yellow-400">
                    ★
                </span>
            );
        }
        // Half star
        if (halfStar) {
            stars.push(
                <span key="half" className="text-yellow-400">
                    ★
                </span>
            );
        }
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <span key={`empty-${i}`} className="text-gray-300">
                    ★
                </span>
            );
        }
        return stars;
    };

    // Handle player count text
    const getSinglePlayerText = (single_player: boolean) => {
        return single_player ? "싱글" : "";
    };
    const getMultiPlayerText = (multi_player: boolean) => {
        return multi_player ? "멀티" : "";
    };

    // New utility function to truncate text
    const truncateText = (text: string, maxLength: number = 10) => {
        return text.length > maxLength
            ? `${text.substring(0, maxLength)}...`
            : text;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <p>로딩 중...</p>
            </div>
        );
    }

    if (error || !gameDetail) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <p>{error || "게임 정보를 불러올 수 없습니다."}</p>
            </div>
        );
    }

    // Get categories from API or use a fallback if empty
    const displayCategories =
        gameDetail.categories && gameDetail.categories.length > 0
            ? gameDetail.categories
            : [
                  "액션",
                  "RPG",
                  "다크 판타지",
                  "오픈 월드",
                  "멀티플레이어",
                  "어드벤처",
              ];

    // Collapsed view only shows the first 4 categories
    const collapsedCategories = displayCategories.slice(0, 3);

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
                    {/* Game image banner */}
                    <div className="w-full h-48 bg-gray-200">
                        {gameDetail.thumbnail && (
                            <img
                                src={gameDetail.thumbnail}
                                alt={gameDetail.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    {/* Game title and details */}
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">
                            {gameDetail.title}
                        </h1>

                        <div className="flex justify-between items-start mt-2">
                            <div>
                                <div className="flex items-center space-x-2">
                                    {gameDetail.price !==
                                    gameDetail.lowest_price ? (
                                        <>
                                            <span className="text-gray-500 line-through">
                                                ₩
                                                {gameDetail.price.toLocaleString()}
                                            </span>
                                            <span className="text-orange-500 font-bold text-xl">
                                                ₩
                                                {gameDetail.lowest_price.toLocaleString()}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-gray-800 font-bold text-xl">
                                            ₩{gameDetail.price.toLocaleString()}
                                        </span>
                                    )}
                                    {/* External link icon remains the same */}
                                    {/* mvp 기능 제거 */}
                                    {/* <button className="ml-0">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3 w-3 text-orange-500 -translate-y-1"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                            <polyline points="15 3 21 3 21 9" />
                                            <line
                                                x1="10"
                                                y1="14"
                                                x2="21"
                                                y2="3"
                                            />
                                        </svg>
                                    </button> */}
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                    <svg
                                        className="h-4 w-4 text-gray-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="text-sm text-gray-600">
                                        {getSinglePlayerText(
                                            gameDetail.single_play
                                        )}
                                        {gameDetail.single_play &&
                                        gameDetail.multi_play
                                            ? ", "
                                            : ""}
                                        {getMultiPlayerText(
                                            gameDetail.multi_play
                                        )}
                                    </span>
                                    <div className="text-sm">
                                        {renderStars(gameDetail.rating)}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {renderScore(gameDetail.rating)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-left text-xs text-gray-500">
                                <div>
                                    Developer:{" "}
                                    <span className="font-medium">
                                        {truncateText(gameDetail.developer)}
                                    </span>
                                </div>
                                <div>
                                    Publisher:{" "}
                                    <span className="font-medium">
                                        {truncateText(gameDetail.publisher)}
                                    </span>
                                </div>
                                <div>
                                    Released:{" "}
                                    <span className="font-medium">
                                        {gameDetail.release_date}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Game description */}
                        <div className="mt-4">
                            <p className="mt-2 text-sm">
                                {gameDetail.description}
                            </p>
                        </div>

                        {/* Game tags */}
                        <div className="mt-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-gray-600">카테고리</h2>
                                {displayCategories.length > 3 && (
                                    <button
                                        onClick={toggleCategoryExpansion}
                                        className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md"
                                    >
                                        {isCategoryExpanded ? "-" : "+"}
                                    </button>
                                )}
                            </div>

                            {/* Categories - shows only relevant categories */}
                            <div className="overflow-x-auto pb-2 -mx-2 px-2 mt-2">
                                <div className="flex flex-wrap gap-2">
                                    {(displayCategories.length > 3 &&
                                    !isCategoryExpanded
                                        ? collapsedCategories
                                        : displayCategories
                                    ).map((category, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`bg-gray-100 px-4 py-2 rounded-md text-sm whitespace-nowrap text-orange-500`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="mt-8">
                            <div className="flex space-x-2">
                                <button
                                    className={`px-4 py-2 rounded-full text-sm ${
                                        activeTab === "price-comparison"
                                            ? "bg-orange-500 text-white"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                    onClick={() =>
                                        handleTabChange("price-comparison")
                                    }
                                >
                                    가격 비교
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-full text-sm ${
                                        activeTab === "find-party"
                                            ? "bg-orange-500 text-white"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                    onClick={() =>
                                        handleTabChange("find-party")
                                    }
                                >
                                    파티 찾기
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-full text-sm ${
                                        activeTab === "related-videos"
                                            ? "bg-orange-500 text-white"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                    onClick={() =>
                                        handleTabChange("related-videos")
                                    }
                                >
                                    관련 영상
                                </button>
                            </div>

                            {/* Tab content */}
                            <div className="mt-4 py-4 border-t border-gray-200">
                                {activeTab === "price-comparison" && gameId && (
                                    <div>
                                        <PriceTab
                                            gameId={gameId}
                                            currentPrice={
                                                gameDetail.lowest_price
                                            }
                                        />
                                    </div>
                                )}
                                {activeTab === "find-party" && gameId && (
                                    <div>
                                        <div>
                                            <PartyFindTab gameId={gameId} />
                                        </div>
                                    </div>
                                )}
                                {activeTab === "related-videos" && (
                                    <div>
                                        <div className="p-4 text-center text-gray-500">
                                            Coming Soon!
                                        </div>
                                        {/* <VideoTab /> */}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailPage;
