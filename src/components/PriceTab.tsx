import React, { useState, useEffect } from "react";
import {
    // getCurrentPricesByPlatform,
    getHistoricalLowestPrice,
} from "../services/gameService";

interface PriceTabProps {
    gameId: string;
    currentPrice: number;
}

const PriceTab: React.FC<PriceTabProps> = ({ gameId, currentPrice }) => {
    const [historicalLowestPrice, setHistoricalLowestPrice] =
        useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLowestPrice = async () => {
            try {
                // Fetch historical lowest price
                const historicalLowest = await getHistoricalLowestPrice(gameId);
                setHistoricalLowestPrice(historicalLowest);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching historical lowest price:", err);
                setError("가격 정보를 불러오는 데 실패했습니다.");
                setIsLoading(false);
            }
        };

        fetchLowestPrice();
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

            {/* 가격 정보 목록 (MVP에서는 주석 처리) */}
            {/* <div className="p-4">
                <p className="text-sm font-medium mb-3">
                    여러 플랫폼에서 현재 구매가능한 가격이에요.
                </p>

                <div className="space-y-2">
                    // 가격 목록 내용 주석 처리
                </div>
            </div> */}

            {/* 더 많은 플랫폼 보기 버튼 (MVP에서는 주석 처리) */}
            {/* <div className="mt-2 px-3 pb-4">
                <button className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg text-xs hover:bg-gray-200 transition">
                    더 많은 플랫폼 보기
                </button>
            </div> */}
        </div>
    );
};

export default PriceTab;
