import React, { useState } from "react";
import Header from "../components/Header";
import PartyFindTab from "../components/PartyFindTab";
import VideoTab from "../components/VideoTab";
import PriceTab from "../components/PriceTab";

interface DetailPageProps {
    // Add any props if needed
}

const DetailPage: React.FC<DetailPageProps> = () => {
    // Game details state
    const [gameTitle, setGameTitle] = useState<string>(
        "Eddie The Tumbler: Pee Terror"
    );
    const [originalPrice, setOriginalPrice] = useState<number>(24000);
    const [discountPrice, setDiscountPrice] = useState<number>(12000);
    const [playerCount, setPlayerCount] = useState<number>(1);
    const [rating, setRating] = useState<number>(4);
    const [developer, setDeveloper] = useState<string>("MINTROCKET");
    const [publisher, setPublisher] = useState<string>("MINTROCKET");
    const [releaseDate, setReleaseDate] = useState<string>("27 OCT 2022");
    const [gameDescription, setGameDescription] = useState<string>(
        "어두운 증세 세계에서 적과 초자연적인 위협으로 가득 찬 무자비한 세계 도전이 기다리고 있습니다. 전구들과 함께 진흙의 구울을 발견하고 그것을 엘리허 저거하기 위한 결정적인 여정을 떠나십시오. 당신의 선택은 치명적인 전사와 괴물에 맞서 싸우는 새로운 세분을 결정짓게 될 것입니다."
    );

    // Category state for accordion
    const [isCategoryExpanded, setIsCategoryExpanded] =
        useState<boolean>(false);

    // Tab state
    const [activeTab, setActiveTab] = useState<string>("price-comparison");

    // List of relevant game tags/categories for this game
    const relevantCategories = [
        "멀티플레이어",
        "캐주얼",
        "온라인 협동",
        "전략",
        "어드벤처",
        "RPG",
        "액션",
    ];

    // Collapsed view only shows the first 4 categories
    const collapsedCategories = relevantCategories.slice(0, 4);

    const toggleCategoryExpansion = () => {
        setIsCategoryExpanded(!isCategoryExpanded);
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };

    // Render stars based on rating
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={
                        i <= rating ? "text-yellow-400" : "text-gray-300"
                    }
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            <Header />

            <div className="flex-1 overflow-auto">
                {/* Game image banner */}
                <div className="w-full h-48 bg-gray-200"></div>

                {/* Game title and details */}
                <div className="p-6">
                    <h1 className="text-2xl font-bold">{gameTitle}</h1>

                    <div className="flex justify-between items-start mt-2">
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-500 line-through">
                                    ₩{originalPrice.toLocaleString()}
                                </span>
                                <span className="text-orange-500 font-bold text-xl">
                                    ₩{discountPrice.toLocaleString()}
                                </span>
                                {/* External link icon instead of three dots */}
                                <button className="ml-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-500"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                </button>
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
                                    {playerCount} player
                                </span>
                                <div className="text-sm">
                                    {renderStars(rating)}
                                </div>
                            </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                            <div>
                                Developer:{" "}
                                <span className="font-medium">{developer}</span>
                            </div>
                            <div>
                                Publisher:{" "}
                                <span className="font-medium">{publisher}</span>
                            </div>
                            <div>
                                Released:{" "}
                                <span className="font-medium">
                                    {releaseDate}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Game description */}
                    <div className="mt-4">
                        <p className="text-gray-700 text-sm">
                            An adventure, RPG, management hybrid
                        </p>
                        <p className="mt-2 text-sm">{gameDescription}</p>
                    </div>

                    {/* Game tags */}
                    <div className="mt-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-gray-600">카테고리</h2>
                            <button
                                onClick={toggleCategoryExpansion}
                                className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md"
                            >
                                {isCategoryExpanded ? "-" : "+"}
                            </button>
                        </div>

                        {/* Categories - shows only relevant categories */}
                        <div className="overflow-x-auto pb-2 -mx-2 px-2 mt-2">
                            <div className="flex flex-wrap gap-2">
                                {(isCategoryExpanded
                                    ? relevantCategories
                                    : collapsedCategories
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
                                onClick={() => handleTabChange("find-party")}
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
                            {activeTab === "price-comparison" && (
                                <div>
                                    <PriceTab />
                                </div>
                            )}
                            {activeTab === "find-party" && (
                                <div>
                                    <div>
                                        <PartyFindTab />
                                    </div>
                                </div>
                            )}
                            {activeTab === "related-videos" && (
                                <div>
                                    <VideoTab />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailPage;
