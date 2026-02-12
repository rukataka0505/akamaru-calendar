"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { format, isSameDay, areIntervalsOverlapping, startOfDay, endOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarEvent } from "@/lib/types";
import TimeGrid from "./TimeGrid";
import { motion, AnimatePresence } from "framer-motion";

interface DayViewProps {
    currentDate: Date;
    selectedDate: Date | null;
    events: CalendarEvent[];
    onTimeSelect: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
    onPrev?: () => void;
    onNext?: () => void;
}

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0.5,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? "-100%" : "100%",
        opacity: 0.5,
    }),
};

const transition = {
    x: { type: "tween" as const, duration: 0.25, ease: "easeOut" as const },
    opacity: { duration: 0.15 },
};

export default function DayView({
    currentDate,
    selectedDate,
    events,
    onTimeSelect,
    onEventClick,
    onPrev,
    onNext,
}: DayViewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [direction, setDirection] = useState(0);
    const prevDateRef = useRef(currentDate);

    // Swipe state
    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
    const swipeDirectionLockedRef = useRef<"horizontal" | "vertical" | null>(null);
    const [swipeOffsetX, setSwipeOffsetX] = useState(0);
    const isSwiping = useRef(false);

    useEffect(() => {
        if (prevDateRef.current < currentDate) {
            setDirection(1);
        } else if (prevDateRef.current > currentDate) {
            setDirection(-1);
        }
        prevDateRef.current = currentDate;
    }, [currentDate]);

    // Filter events for this day and separate into all-day and time-based
    const { allDayEvents, timeEvents } = React.useMemo(() => {
        const dayStart = startOfDay(currentDate);
        const dayEnd = endOfDay(currentDate);

        const allDay: CalendarEvent[] = [];
        const time: CalendarEvent[] = [];

        events.forEach((event) => {
            const start = new Date(event.start);
            const end = new Date(event.end);
            if (start > end) return;

            if (
                areIntervalsOverlapping(
                    { start, end },
                    { start: dayStart, end: dayEnd }
                )
            ) {
                if (event.allDay) {
                    allDay.push(event);
                } else {
                    time.push(event);
                }
            }
        });
        return { allDayEvents: allDay, timeEvents: time };
    }, [events, currentDate]);

    // Scroll to current time or 8:00 AM
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 480;
        }
    }, []);

    // Touch handlers for swipe navigation
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
        swipeDirectionLockedRef.current = null;
        isSwiping.current = false;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStartRef.current) return;
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;

        // Lock direction on first significant movement
        if (!swipeDirectionLockedRef.current) {
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            if (absDx < 5 && absDy < 5) return;

            if (absDx > absDy * 1.2) {
                swipeDirectionLockedRef.current = "horizontal";
                isSwiping.current = true;
            } else {
                swipeDirectionLockedRef.current = "vertical";
                return;
            }
        }

        if (swipeDirectionLockedRef.current === "horizontal") {
            e.preventDefault();
            setSwipeOffsetX(dx);
        }
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!touchStartRef.current) return;

        if (swipeDirectionLockedRef.current === "horizontal") {
            const threshold = 50;
            if (swipeOffsetX < -threshold && onNext) {
                onNext();
            } else if (swipeOffsetX > threshold && onPrev) {
                onPrev();
            }
        }

        touchStartRef.current = null;
        swipeDirectionLockedRef.current = null;
        isSwiping.current = false;
        setSwipeOffsetX(0);
    }, [swipeOffsetX, onPrev, onNext]);

    const dayKey = format(currentDate, "yyyy-MM-dd");

    return (
        <div
            className="flex flex-col h-full bg-white overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={dayKey}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={transition}
                    style={{
                        transform: swipeOffsetX !== 0 ? `translateX(${swipeOffsetX}px)` : undefined,
                    }}
                    className="flex flex-col h-full w-full bg-white relative"
                >
                    {/* Unified Scroll Container */}
                    <div className="flex-1 overflow-y-auto relative flex flex-col" ref={scrollRef}>

                        {/* Sticky Header Container */}
                        <div className="sticky top-0 z-30 bg-white shadow-sm shrink-0 flex flex-col">
                            {/* Day Header */}
                            <div className="flex items-center justify-center py-3 border-b border-border bg-white">
                                <div className="flex flex-col items-center">
                                    <span className="text-sm text-muted-foreground font-medium mb-0.5">
                                        {format(currentDate, "E曜日", { locale: ja })}
                                    </span>
                                    <span className={`text-3xl font-bold ${isSameDay(currentDate, new Date()) ? "text-accent" : "text-foreground"
                                        }`}>
                                        {format(currentDate, "d")}
                                    </span>
                                </div>
                            </div>

                            {/* All Day Row - Fixed height, always shown when there are all-day events */}
                            {allDayEvents.length > 0 && (
                                <div className="flex bg-white border-b border-border">
                                    {/* Spacer (Width matches time column) */}
                                    <div className="w-16 border-r border-border shrink-0 bg-white flex items-center justify-center">
                                        <span className="text-[9px] text-muted-foreground">終日</span>
                                    </div>

                                    <div className="flex-1 p-1 flex flex-col gap-0.5 min-h-[28px] max-h-[56px] overflow-y-auto">
                                        {allDayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEventClick(event);
                                                }}
                                                className="text-[10px] text-white px-2 py-1 rounded truncate cursor-pointer shrink-0"
                                                style={{ backgroundColor: event.color }}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Time Grid Row */}
                        <div className="flex relative min-h-[1440px]">
                            {/* Time Labels Column (Sticky Left) */}
                            <div className="sticky left-0 bg-white z-10 w-16 border-r border-border shrink-0 h-full">
                                <div className="relative h-full w-full">
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute right-0 w-full border-b border-transparent flex justify-end pr-3"
                                            style={{ top: `${i * 60}px`, height: '60px' }}
                                        >
                                            <span className="text-xs text-muted-foreground font-medium -mt-3 block">
                                                {i}:00
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Day Column */}
                            <div className="flex-1 relative h-full">
                                <TimeGrid
                                    date={currentDate}
                                    events={timeEvents}
                                    selectedDate={selectedDate}
                                    onTimeSelect={onTimeSelect}
                                    onEventClick={onEventClick}
                                    showTimeLabels={false}
                                    className="bg-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
