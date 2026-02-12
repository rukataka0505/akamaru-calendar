"use client";

import React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Settings, Search } from "lucide-react";

interface CalendarHeaderProps {
    currentDate: Date;
    onPrev: () => void;
    onNext: () => void;
    onToday?: () => void;
}

export default function CalendarHeader({
    currentDate,
    onPrev,
    onNext,
    onToday,
}: CalendarHeaderProps) {
    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white shrink-0">
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                    {format(currentDate, "yyyy年M月", { locale: ja })}
                    {/* Day view might want to show day too, but keeping it simple for now, 
              or we can pass a format string prop */}
                </h2>
            </div>

            <div className="flex items-center gap-1">
                {/* Navigation Buttons */}


                <button
                    onClick={onPrev}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={onNext}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronRight size={20} />
                </button>

                {/* Placeholder for Search/Settings if needed, based on screenshot */}
                <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Search size={20} />
                </button>
                <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Settings size={20} />
                </button>
            </div>
        </div>
    );
}
