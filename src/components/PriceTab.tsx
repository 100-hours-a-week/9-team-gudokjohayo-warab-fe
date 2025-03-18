import React, { useState, useEffect } from "react";

interface PriceTabProps {
    // Add any props if needed
}

interface PriceInfo {
    id: string;
    store: string;
    logo: string;
    price: number;
}

const PriceTab: React.FC<PriceTabProps> = () => {
    // 가격 정보 데이터
    const [priceInfo] = useState<PriceInfo[]>([
        {
            id: "1",
            store: "Epic games",
            logo: "/images/epic-logo.png",
            price: 1330,
        },
        {
            id: "2",
            store: "Steam",
            logo: "/images/steam-logo.png",
            price: 1800,
        },
        {
            id: "3",
            store: "Epic games",
            logo: "/images/epic-logo.png",
            price: 1990,
        },
    ]);

    // 가격 정보 API 호출을 위한 함수 (실제 구현에서는 API 호출)
    const fetchPriceInfo = async () => {
        try {
            // 실제 구현에서는 API에서 가격 정보를 가져옴
            // const response = await fetch('your-api-endpoint');
            // const data = await response.json();
            // setPriceInfo(data);

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
    }, []);

    // 가격 포맷 함수 (예: 1800 -> ₩1,800)
    const formatPrice = (price: number) => {
        return `₩${price.toLocaleString()}`;
    };

    // 최저가 확인 함수
    const isLowestPrice = (price: number) => {
        const lowestPrice = Math.min(...priceInfo.map((item) => item.price));
        return price === lowestPrice;
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* 가격 비교 헤더 */}
            <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-medium">
                    출시일부터 현재까지의 최저가에요.
                </h3>
            </div>

            {/* 가격 정보 시각화 (그래프) */}
            <div className="p-3 border-b border-gray-200 bg-gray-900">
                <div className="h-16 w-full relative">
                    {/* 실제 구현에서는 여기에 그래프가 들어갑니다 */}
                    <div className="absolute top-0 left-0 right-0 h-full">
                        <svg
                            width="100%"
                            height="100%"
                            viewBox="0 0 400 60"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M0,40 L20,20 L40,40 L60,20 L80,40 L100,20 L120,40 L140,20 L160,40 L180,20 L240,20 L260,40 L280,20 L300,40 L320,20 L340,40 L360,20 L380,40 L400,20"
                                stroke="#9AE6B4"
                                strokeWidth="2"
                                fill="none"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* 가격 정보 목록 */}
            <div className="p-3">
                <p className="text-xs mb-3">
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
                                <span className="text-xs font-medium">
                                    {item.store}
                                </span>
                            </div>
                            <span className="text-xs font-medium">
                                {formatPrice(item.price)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 더 많은 플랫폼 보기 버튼 */}
            <div className="mt-2 px-3">
                <button className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg text-xs hover:bg-gray-200 transition">
                    더 많은 플랫폼 보기
                </button>
            </div>
        </div>
    );
};

export default PriceTab;
