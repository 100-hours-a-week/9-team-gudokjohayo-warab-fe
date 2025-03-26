import React, { useState, useEffect } from "react";

interface PriceTabProps {
    currentPrice: number;
    historicalLowestPrice: number;
}

interface PriceInfo {
    id: string;
    store: string;
    logo: string;
    price: number;
    historicalLowest?: number;
    historicalLowestDate?: string;
}

const PriceTab: React.FC<PriceTabProps> = ({
    currentPrice,
    historicalLowestPrice,
}) => {
    // 가격 정보 데이터
    const [priceInfo] = useState<PriceInfo[]>([
        {
            id: "1",
            store: "Epic games",
            logo: "/images/epic-logo.png",
            price: currentPrice,
            historicalLowest: historicalLowestPrice,
            historicalLowestDate: "2023-12-25",
        },
        {
            id: "2",
            store: "Steam",
            logo: "/images/steam-logo.png",
            price: currentPrice,
            historicalLowest: historicalLowestPrice,
            historicalLowestDate: "2023-11-20",
        },
        {
            id: "3",
            store: "Ubisoft",
            logo: "/images/ubisoft-logo.png",
            price: currentPrice,
            historicalLowest: historicalLowestPrice,
            historicalLowestDate: "2024-01-15",
        },
    ]);

    // 전체 최저가 정보
    const [overallLowestPrice, setOverallLowestPrice] = useState<{
        current: number;
        historical: number;
        store: string;
        historicalDate: string;
    }>({
        current: 0,
        historical: 0,
        store: "",
        historicalDate: "",
    });

    // 가격 정보 API 호출을 위한 함수 (실제 구현에서는 API 호출)
    const fetchPriceInfo = async () => {
        try {
            console.log(
                "가격 정보를 API에서 가져오는 로직이 여기에 들어갑니다"
            );
        } catch (error) {
            console.error("가격 정보 가져오기 오류:", error);
        }
    };

    useEffect(() => {
        // 컴포넌트 마운트 시 가격 정보 가져오기
        fetchPriceInfo();

        // 전체 최저가 계산
        const currentLowest = Math.min(...priceInfo.map((item) => item.price));
        const historicalLowest = Math.min(
            ...priceInfo.map((item) => item.historicalLowest || Infinity)
        );

        const lowestCurrentStore =
            priceInfo.find((item) => item.price === currentLowest)?.store || "";

        const lowestHistoricalItem = priceInfo.reduce(
            (prev, current) => {
                if (!current.historicalLowest) return prev;
                if (
                    !prev ||
                    current.historicalLowest <
                        (prev.historicalLowest || Infinity)
                ) {
                    return current;
                }
                return prev;
            },
            null as PriceInfo | null
        );

        setOverallLowestPrice({
            current: currentLowest,
            historical: historicalLowest,
            store: lowestCurrentStore,
            historicalDate: lowestHistoricalItem?.historicalLowestDate || "",
        });
    }, [priceInfo]);

    // 가격 포맷 함수 (예: 1800 -> ₩1,800)
    const formatPrice = (price: number) => {
        return `₩${price.toLocaleString()}`;
    };

    // 날짜 포맷 함수
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // 최저가 확인 함수
    const isLowestPrice = (price: number) => {
        const lowestPrice = Math.min(...priceInfo.map((item) => item.price));
        return price === lowestPrice;
    };

    // 역대 최저가 대비 현재 가격 비율 계산
    const calculatePriceRatio = () => {
        if (overallLowestPrice.historical === 0) return 100;
        return Math.round(
            (overallLowestPrice.current / overallLowestPrice.historical) * 100
        );
    };

    // 가격 차이 계산
    const calculatePriceDifference = () => {
        return overallLowestPrice.current - overallLowestPrice.historical;
    };

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
                                {formatPrice(overallLowestPrice.historical)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatDate(overallLowestPrice.historicalDate)}
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
                            <p className="text-xs text-gray-500">현재 최저가</p>
                            <p className="text-lg font-bold">
                                {formatPrice(overallLowestPrice.current)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {overallLowestPrice.store}
                            </p>
                        </div>
                    </div>

                    {/* 가격 비교 바 */}
                    <div className="mt-4">
                        <div className="relative pt-1">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <span className="text-xs font-semibold inline-block text-green-600">
                                        역대가 대비 {calculatePriceRatio()}%
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

            {/* 가격 정보 목록 */}
            <div className="p-4">
                <p className="text-sm font-medium mb-3">
                    여러 플랫폼에서 현재 구매가능한 가격이에요.
                </p>

                <div className="space-y-2">
                    {priceInfo.map((item) => (
                        <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                                isLowestPrice(item.price)
                                    ? "bg-gray-100"
                                    : "bg-gray-50"
                            }`}
                        >
                            <div className="flex items-center">
                                <div className="w-8 h-8 mr-2 flex-shrink-0 flex items-center justify-center bg-gray-200 rounded-md overflow-hidden">
                                    <img
                                        src={item.logo}
                                        alt={item.store}
                                        className="w-6 h-6 object-contain"
                                        onError={(e) => {
                                            // 이미지 로드 실패 시 대체 이미지
                                            (e.target as HTMLImageElement).src =
                                                "/images/placeholder.png";
                                        }}
                                    />
                                </div>
                                <div>
                                    <span className="text-xs font-medium block">
                                        {item.store}
                                    </span>
                                    {item.historicalLowest && (
                                        <span className="text-xs text-gray-500 block">
                                            역대:{" "}
                                            {formatPrice(item.historicalLowest)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-medium block">
                                    {formatPrice(item.price)}
                                </span>
                                {item.price === item.historicalLowest && (
                                    <span className="text-xs text-green-600 block">
                                        역대 최저가!
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 더 많은 플랫폼 보기 버튼 */}
            <div className="mt-2 px-3 pb-4">
                <button className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg text-xs hover:bg-gray-200 transition">
                    더 많은 플랫폼 보기
                </button>
            </div>
        </div>
    );
};

export default PriceTab;
