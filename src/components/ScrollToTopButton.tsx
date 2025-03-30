import React, { useState, useEffect } from "react";

interface ScrollToTopButtonProps {
    threshold?: number; // 버튼이 보이기 시작할 스크롤 위치 (픽셀)
    bottom?: number; // 버튼의 하단 위치 (픽셀)
    right?: number; // 버튼의 우측 위치 (픽셀)
    size?: number; // 버튼 크기 (픽셀)
    backgroundColor?: string; // 버튼 배경색
    iconColor?: string; // 아이콘 색상
    smoothScroll?: boolean; // 부드러운 스크롤 여부
    containerWidth?: number; // 컨테이너 너비 (픽셀)
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
    threshold = 300,
    bottom = 20,
    right = 20,
    size = 40,
    backgroundColor = "#FF6B00",
    iconColor = "white",
    smoothScroll = true,
    containerWidth,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    // 스크롤 위치에 따라 버튼 표시 여부 결정
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > threshold) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, [threshold]);

    // 맨 위로 스크롤하는 함수
    const scrollToTop = () => {
        if (smoothScroll) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } else {
            window.scrollTo(0, 0);
        }
    };

    // 모바일 화면을 위한 위치 계산
    const calculateRightPosition = () => {
        if (containerWidth) {
            // 화면 중앙에서 컨테이너의 오른쪽 가장자리까지의 거리 계산
            const windowWidth = window.innerWidth;
            const containerLeftEdge = (windowWidth - containerWidth) / 2;
            const rightFromContainer = right;

            // 화면 오른쪽에서부터의 거리 계산
            return Math.max(
                windowWidth -
                    (containerLeftEdge + containerWidth) +
                    rightFromContainer,
                right
            );
        }
        return right;
    };

    return isVisible ? (
        <button
            onClick={scrollToTop}
            style={{
                position: "fixed",
                bottom: `${bottom}px`,
                right: `${calculateRightPosition()}px`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: backgroundColor,
                color: iconColor,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                zIndex: 1000,
                transition: "all 0.3s ease",
            }}
            aria-label="맨 위로 스크롤"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size / 2}
                height={size / 2}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M18 15l-6-6-6 6" />
            </svg>
        </button>
    ) : null;
};

export default ScrollToTopButton;
