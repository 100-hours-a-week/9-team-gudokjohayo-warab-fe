import React, { useState, useEffect, useRef, useCallback } from "react";

interface PriceRangeSliderProps {
    minPrice?: number;
    maxPrice?: number;
    initialRange?: [number, number];
    onRangeChange: (range: [number, number]) => void;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
    minPrice = 0,
    maxPrice = 200000,
    initialRange = [0, 100000],
    onRangeChange,
}) => {
    const [range, setRange] = useState<[number, number]>(initialRange);
    const [isDraggingMin, setIsDraggingMin] = useState<boolean>(false);
    const [isDraggingMax, setIsDraggingMax] = useState<boolean>(false);
    const [isDraggingBar, setIsDraggingBar] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<number>(0);
    const [barWidth, setBarWidth] = useState<number>(0);

    const containerRef = useRef<HTMLDivElement | null>(null);

    // Update range when initialRange prop changes
    useEffect(() => {
        setRange(initialRange);
    }, [initialRange]);

    // Calculate position percentage from price value - wrapped in useCallback
    const getPositionFromValue = useCallback(
        (value: number): number => {
            return ((value - minPrice) / (maxPrice - minPrice)) * 100;
        },
        [minPrice, maxPrice]
    );

    // Calculate price value from position percentage - wrapped in useCallback
    const getValueFromPosition = useCallback(
        (position: number): number => {
            const percent = Math.max(0, Math.min(100, position)) / 100;
            const value = percent * (maxPrice - minPrice) + minPrice;
            return Math.round(value / 10000) * 10000; // Round to nearest 10,000
        },
        [minPrice, maxPrice]
    );

    // Mouse down handler for thumbs and bar
    const handleMouseDown = (
        e: React.MouseEvent,
        type: "min" | "max" | "bar"
    ): void => {
        e.preventDefault();
        if (type === "min") {
            setIsDraggingMin(true);
        } else if (type === "max") {
            setIsDraggingMax(true);
        } else if (type === "bar") {
            setIsDraggingBar(true);
            setDragStart(e.clientX);
            setBarWidth(
                getPositionFromValue(range[1]) - getPositionFromValue(range[0])
            );
        }
    };

    // Touch start handler for thumbs and bar
    const handleTouchStart = (
        e: React.TouchEvent,
        type: "min" | "max" | "bar"
    ): void => {
        if (type === "min") {
            setIsDraggingMin(true);
        } else if (type === "max") {
            setIsDraggingMax(true);
        } else if (type === "bar") {
            setIsDraggingBar(true);
            setDragStart(e.touches[0].clientX);
            setBarWidth(
                getPositionFromValue(range[1]) - getPositionFromValue(range[0])
            );
        }
    };

    // Mouse move handler
    const handleMouseMove = useCallback(
        (e: MouseEvent): void => {
            if (!isDraggingMin && !isDraggingMax && !isDraggingBar) return;
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const position =
                ((e.clientX - containerRect.left) / containerRect.width) * 100;

            if (isDraggingMin) {
                const newMinPos = Math.max(
                    0,
                    Math.min(getPositionFromValue(range[1]) - 5, position)
                );
                const newMinValue = getValueFromPosition(newMinPos);
                setRange([newMinValue, range[1]]);
                onRangeChange([newMinValue, range[1]]);
            } else if (isDraggingMax) {
                const newMaxPos = Math.min(
                    100,
                    Math.max(getPositionFromValue(range[0]) + 5, position)
                );
                const newMaxValue = getValueFromPosition(newMaxPos);
                setRange([range[0], newMaxValue]);
                onRangeChange([range[0], newMaxValue]);
            } else if (isDraggingBar) {
                const deltaX = e.clientX - dragStart;
                const deltaPercent = (deltaX / containerRect.width) * 100;

                let newMinPos = getPositionFromValue(range[0]) + deltaPercent;
                let newMaxPos = getPositionFromValue(range[1]) + deltaPercent;

                if (newMinPos < 0) {
                    newMinPos = 0;
                    newMaxPos = barWidth;
                }

                if (newMaxPos > 100) {
                    newMaxPos = 100;
                    newMinPos = 100 - barWidth;
                }

                const newMinValue = getValueFromPosition(newMinPos);
                const newMaxValue = getValueFromPosition(newMaxPos);

                setRange([newMinValue, newMaxValue]);
                onRangeChange([newMinValue, newMaxValue]);
                setDragStart(e.clientX);
            }
        },
        [
            isDraggingMin,
            isDraggingMax,
            isDraggingBar,
            range,
            barWidth,
            dragStart,
            onRangeChange,
            getPositionFromValue,
            getValueFromPosition,
        ]
    );

    // Touch move handler
    const handleTouchMove = useCallback(
        (e: TouchEvent): void => {
            if (!isDraggingMin && !isDraggingMax && !isDraggingBar) return;
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const position =
                ((e.touches[0].clientX - containerRect.left) /
                    containerRect.width) *
                100;

            if (isDraggingMin) {
                const newMinPos = Math.max(
                    0,
                    Math.min(getPositionFromValue(range[1]) - 5, position)
                );
                const newMinValue = getValueFromPosition(newMinPos);
                setRange([newMinValue, range[1]]);
                onRangeChange([newMinValue, range[1]]);
            } else if (isDraggingMax) {
                const newMaxPos = Math.min(
                    100,
                    Math.max(getPositionFromValue(range[0]) + 5, position)
                );
                const newMaxValue = getValueFromPosition(newMaxPos);
                setRange([range[0], newMaxValue]);
                onRangeChange([range[0], newMaxValue]);
            } else if (isDraggingBar) {
                const deltaX = e.touches[0].clientX - dragStart;
                const deltaPercent = (deltaX / containerRect.width) * 100;

                let newMinPos = getPositionFromValue(range[0]) + deltaPercent;
                let newMaxPos = getPositionFromValue(range[1]) + deltaPercent;

                if (newMinPos < 0) {
                    newMinPos = 0;
                    newMaxPos = barWidth;
                }

                if (newMaxPos > 100) {
                    newMaxPos = 100;
                    newMinPos = 100 - barWidth;
                }

                const newMinValue = getValueFromPosition(newMinPos);
                const newMaxValue = getValueFromPosition(newMaxPos);

                setRange([newMinValue, newMaxValue]);
                onRangeChange([newMinValue, newMaxValue]);
                setDragStart(e.touches[0].clientX);
            }
        },
        [
            isDraggingMin,
            isDraggingMax,
            isDraggingBar,
            range,
            barWidth,
            dragStart,
            onRangeChange,
            getPositionFromValue,
            getValueFromPosition,
        ]
    );

    // Mouse/Touch up handler - wrapped in useCallback
    const handleMouseUp = useCallback((): void => {
        setIsDraggingMin(false);
        setIsDraggingMax(false);
        setIsDraggingBar(false);
    }, []);

    // Add event listeners when dragging starts
    useEffect(() => {
        if (isDraggingMin || isDraggingMax || isDraggingBar) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.addEventListener("touchmove", handleTouchMove);
            document.addEventListener("touchend", handleMouseUp);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleMouseUp);
        };
    }, [
        isDraggingMin,
        isDraggingMax,
        isDraggingBar,
        handleMouseMove,
        handleTouchMove,
        handleMouseUp,
    ]);

    return (
        <div className="mt-6 mb-2">
            <div className="flex items-center justify-between mb-4">
                <div className="px-2 py-2 rounded w-24 text-center">
                    {range[0].toLocaleString()} 원
                </div>
                <span className="mx-2 text-gray-600">~</span>
                <div className="px-2 py-2 rounded w-24 text-center">
                    {range[1].toLocaleString()} 원
                </div>
            </div>

            <div
                ref={containerRef}
                className="relative h-2 bg-gray-200 rounded-full"
            >
                {/* Progress Bar */}
                <div
                    className="absolute h-full bg-orange-500 rounded-full cursor-pointer"
                    style={{
                        left: `${getPositionFromValue(range[0])}%`,
                        width: `${getPositionFromValue(range[1]) - getPositionFromValue(range[0])}%`,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, "bar")}
                    onTouchStart={(e) => handleTouchStart(e, "bar")}
                ></div>

                {/* Min Handle */}
                <div
                    className="absolute w-6 h-6 -ml-3 -mt-2 bg-white border-2 border-orange-500 rounded-full cursor-pointer"
                    style={{ left: `${getPositionFromValue(range[0])}%` }}
                    onMouseDown={(e) => handleMouseDown(e, "min")}
                    onTouchStart={(e) => handleTouchStart(e, "min")}
                ></div>

                {/* Max Handle */}
                <div
                    className="absolute w-6 h-6 -ml-3 -mt-2 bg-white border-2 border-orange-500 rounded-full cursor-pointer"
                    style={{ left: `${getPositionFromValue(range[1])}%` }}
                    onMouseDown={(e) => handleMouseDown(e, "max")}
                    onTouchStart={(e) => handleTouchStart(e, "max")}
                ></div>
            </div>
        </div>
    );
};

// Export interface and component
interface RangeSliderProps {
    minPrice?: number;
    maxPrice?: number;
    initialRange?: [number, number];
    onRangeChange?: (range: [number, number]) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = (props) => {
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

    return (
        <div className="rounded-lg">
            <PriceRangeSlider
                minPrice={props.minPrice || 0}
                maxPrice={props.maxPrice || 200000}
                initialRange={props.initialRange || priceRange}
                onRangeChange={props.onRangeChange || setPriceRange}
            />
        </div>
    );
};

export default RangeSlider;
