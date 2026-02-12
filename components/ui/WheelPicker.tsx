"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface WheelPickerProps {
    items: { label: string; value: string | number }[];
    selectedValue: string | number;
    onChange: (value: string | number) => void;
    height?: number;
    itemHeight?: number;
}

export default function WheelPicker({
    items,
    selectedValue,
    onChange,
    height = 200,
    itemHeight = 40,
}: WheelPickerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isUserScrolling = useRef(false);
    const timerRef = useRef<NodeJS.Timeout>(null);
    const isMounted = useRef(false);

    const halfHeight = height / 2;
    const paddingY = halfHeight - itemHeight / 2;

    // Compute visual transforms for each item based on scroll position
    const updateItemStyles = useCallback(() => {
        const container = scrollRef.current;
        if (!container) return;

        const scrollTop = container.scrollTop;
        const centerY = scrollTop + halfHeight;
        const itemElements = container.querySelectorAll<HTMLDivElement>("[data-wheel-item]");

        itemElements.forEach((el, i) => {
            const itemCenterY = paddingY + i * itemHeight + itemHeight / 2;
            const distFromCenter = itemCenterY - centerY;
            // Normalize: 0 = center, 1 = one itemHeight away
            const normalizedDist = distFromCenter / itemHeight;
            const absDist = Math.abs(normalizedDist);

            // 3D rotation (tilt items away from center like a barrel)
            const maxRotation = 25;
            const rotateX = Math.max(-maxRotation, Math.min(maxRotation, -normalizedDist * 18));

            // Scale: center = 1.0, edges shrink
            const scale = Math.max(0.6, 1 - absDist * 0.08);

            // Opacity: center = 1, edges fade
            const opacity = Math.max(0.15, 1 - absDist * 0.25);

            // Font weight: bold at center
            const isCenterItem = absDist < 0.5;

            el.style.transform = `perspective(400px) rotateX(${rotateX}deg) scale(${scale})`;
            el.style.opacity = String(opacity);
            el.style.fontWeight = isCenterItem ? "600" : "400";
            el.style.fontSize = isCenterItem ? "22px" : `${Math.max(14, 18 - absDist * 2)}px`;
            el.style.color = isCenterItem ? "#1a1a1a" : "#999";
        });
    }, [halfHeight, itemHeight, paddingY]);

    // Initial scroll position (no animation)
    useEffect(() => {
        if (scrollRef.current) {
            const index = items.findIndex((item) => item.value === selectedValue);
            if (index !== -1) {
                scrollRef.current.scrollTop = index * itemHeight;
            }
            // Run style update after initial scroll
            requestAnimationFrame(updateItemStyles);
            isMounted.current = true;
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync scroll when value changes externally
    useEffect(() => {
        if (scrollRef.current && isMounted.current && !isUserScrolling.current) {
            const index = items.findIndex((item) => item.value === selectedValue);
            if (index !== -1) {
                scrollRef.current.scrollTo({
                    top: index * itemHeight,
                    behavior: "smooth",
                });
            }
        }
    }, [selectedValue, items, itemHeight]);

    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;

        isUserScrolling.current = true;
        updateItemStyles();

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            isUserScrolling.current = false;
            if (!scrollRef.current) return;

            const scrollTop = scrollRef.current.scrollTop;
            const index = Math.round(scrollTop / itemHeight);
            const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

            // Snap to position
            scrollRef.current.scrollTo({
                top: clampedIndex * itemHeight,
                behavior: "smooth",
            });

            const selectedItem = items[clampedIndex];
            if (selectedItem && selectedItem.value !== selectedValue) {
                onChange(selectedItem.value);
            }

            // Update styles after snap
            requestAnimationFrame(updateItemStyles);
        }, 80);
    }, [itemHeight, items, selectedValue, onChange, updateItemStyles]);

    return (
        <div
            className="relative w-full overflow-hidden"
            style={{ height }}
        >
            {/* Selection indicator band */}
            <div
                className="absolute left-2 right-2 pointer-events-none z-10 rounded-lg"
                style={{
                    top: paddingY,
                    height: itemHeight,
                    background: "rgba(120, 120, 128, 0.12)",
                }}
            />

            {/* Top & bottom gradient fades for depth */}
            <div
                className="absolute top-0 left-0 right-0 pointer-events-none z-20"
                style={{
                    height: paddingY * 0.6,
                    background: "linear-gradient(to bottom, rgba(249,249,249,0.9), transparent)",
                }}
            />
            <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none z-20"
                style={{
                    height: paddingY * 0.6,
                    background: "linear-gradient(to top, rgba(249,249,249,0.9), transparent)",
                }}
            />

            {/* Scrollable area */}
            <div
                ref={scrollRef}
                className="h-full w-full overflow-y-auto no-scrollbar"
                onScroll={handleScroll}
                style={{ touchAction: "pan-y" }}
            >
                <div
                    style={{
                        paddingTop: paddingY,
                        paddingBottom: paddingY,
                    }}
                >
                    {items.map((item) => (
                        <div
                            key={item.value}
                            data-wheel-item
                            className="flex items-center justify-center transition-none select-none"
                            style={{
                                height: itemHeight,
                                willChange: "transform, opacity",
                            }}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
