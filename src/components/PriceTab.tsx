import React, { useState, useEffect } from "react";
import {
    getCurrentPricesByPlatform,
    getHistoricalLowestPrice,
} from "../services/gameService";

interface PriceTabProps {
    gameId: string;
    currentPrice: number;
}

interface PlatformPrice {
    platform: string;
    discount_price: number;
    discount_rate: number;
    store_url: string;
    logo: string;
}

const PriceTab: React.FC<PriceTabProps> = ({ gameId, currentPrice }) => {
    const [historicalLowestPrice, setHistoricalLowestPrice] =
        useState<number>(0);
    const [platformPrices, setPlatformPrices] = useState<PlatformPrice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch historical lowest price
                const historicalLowest = await getHistoricalLowestPrice(gameId);
                setHistoricalLowestPrice(historicalLowest);

                // Fetch current prices by platform
                const pricesData = await getCurrentPricesByPlatform(gameId);
                setPlatformPrices(pricesData);

                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching price data:", err);
                setError("가격 정보를 불러오는 데 실패했습니다.");
                setIsLoading(false);
            }
        };

        fetchData();
    }, [gameId]);

    // 가격 포맷 함수 (예: 1800 -> ₩1,800)
    const formatPrice = (price: number) => {
        return `₩${price.toLocaleString()}`;
    };

    // 역대 최저가 대비 현재 가격 비율 계산
    const calculatePriceRatio = () => {
        if (historicalLowestPrice === 0) return 100;
        return Math.round((currentPrice / historicalLowestPrice) * 100);
    };

    // 가격 차이 계산
    const calculatePriceDifference = () => {
        return currentPrice - historicalLowestPrice;
    };

    // 현재 가격이 역대 최저가인지 확인
    const isCurrentPriceLowest = () => {
        return currentPrice <= historicalLowestPrice;
    };

    // 최저가 플랫폼 찾기
    const findLowestPricePlatform = () => {
        if (platformPrices.length === 0) return null;

        return platformPrices.reduce((lowest, current) => {
            return current.discount_price < lowest.discount_price
                ? current
                : lowest;
        }, platformPrices[0]);
    };

    const lowestPricePlatform = findLowestPricePlatform();

    if (isLoading) {
        return <div className="p-4 text-center">로딩 중...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* 역대 최저가 비교 섹션 */}
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium mb-3">역대 최저가 비교</h3>

                <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <p className="text-xs text-gray-500">역대 최저가</p>
                            <p className="text-lg font-bold text-green-600">
                                {formatPrice(historicalLowestPrice)}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded-full overflow-hidden">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">현재 가격</p>
                            <p className="text-lg font-bold">
                                {formatPrice(currentPrice)}
                            </p>
                        </div>
                    </div>

                    {/* 가격 비교 바 */}
                    <div className="mt-4">
                        <div className="relative pt-1">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <span className="text-xs font-semibold inline-block text-green-600">
                                        {isCurrentPriceLowest()
                                            ? "현재가 최저가입니다"
                                            : `역대가 대비 ${calculatePriceRatio()}%`}
                                    </span>
                                </div>
                                <div>
                                    <span
                                        className={`text-xs font-semibold inline-block ${
                                            calculatePriceDifference() > 0
                                                ? "text-orange-500"
                                                : "text-green-600"
                                        }`}
                                    >
                                        {calculatePriceDifference() > 0
                                            ? "+"
                                            : ""}
                                        {formatPrice(
                                            calculatePriceDifference()
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 플랫폼별 가격 비교 섹션 - 개선된 버전 */}
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">플랫폼별 가격 비교</h3>
                    {lowestPricePlatform && (
                        <div className="flex items-center text-xs text-green-600 font-medium">
                            <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            최저가 플랫폼: {lowestPricePlatform.platform}
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm">
                    {platformPrices.map((item, index) => (
                        <a
                            key={index}
                            href={item.store_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex justify-between items-center p-4 hover:bg-gray-100 transition cursor-pointer ${
                                index !== platformPrices.length - 1
                                    ? "border-b border-gray-200"
                                    : ""
                            } ${lowestPricePlatform && item.platform === lowestPricePlatform.platform ? "bg-green-50" : ""}`}
                        >
                            <div className="flex items-center space-x-3">
                                {/* <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    {item.logo ? (
                                        <img
                                            src={item.logo}
                                            alt={`${item.platform} 로고`}
                                            className="w-6 h-6 object-contain"
                                        />
                                    ) : (
                                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                            {item.platform.charAt(0)}
                                        </div>
                                    )}
                                </div> */}
                                <div>
                                    <p className="font-medium text-gray-800">
                                        {item.platform}
                                    </p>
                                    {lowestPricePlatform &&
                                        item.platform ===
                                            lowestPricePlatform.platform && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                최저가
                                            </span>
                                        )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                {item.discount_rate > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded">
                                        {`-${item.discount_rate}%`}
                                    </span>
                                )}
                                <div className="flex items-center">
                                    <span className="text-lg font-bold">
                                        {formatPrice(item.discount_price)}
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                <p className="text-xs text-gray-500 mt-3">
                    가격은 정기적으로 업데이트되며, 변동될 수 있습니다.
                </p>
            </div>
        </div>
    );
};

export default PriceTab;
