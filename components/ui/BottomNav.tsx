"use client";

import React from "react";
import { CalendarDays, Image, Grid3X3, Columns, RectangleVertical, Undo, Plus } from "lucide-react";

type TabType = "month" | "week" | "day" | "album";

interface BottomNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    onAddClick: () => void;
}

export default function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: "month", label: "月", icon: Grid3X3 },
        { id: "week", label: "週", icon: Columns },
        { id: "day", label: "日", icon: RectangleVertical },
        { id: "album", label: "アルバム", icon: Image },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto">
            <div className="nav-glass border-t border-white/10">
                <div className="flex items-center justify-around py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] w-full px-2">
                    {/* Today Button */}
                    <button
                        onClick={() => onTabChange("today" as any)} // Cast to any to bypass strict TabType check for this action
                        className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground"
                    >
                        <Undo size={22} strokeWidth={1.8} className="transition-all duration-200" />
                        <span className="text-[0.6rem] font-medium">今日</span>
                    </button>

                    {tabs.map(({ id, label, icon: Icon }) => {
                        const isActive = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => onTabChange(id)}
                                className={`
                  flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200
                  ${isActive
                                        ? "text-accent"
                                        : "text-muted-foreground hover:text-foreground"
                                    }
                `}
                            >
                                <Icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                    className="transition-all duration-200"
                                />
                                <span className={`text-[0.6rem] font-medium ${isActive ? "font-semibold" : ""}`}>
                                    {label}
                                </span>
                                {isActive && (
                                    <div className="absolute -bottom-0 w-8 h-0.5 rounded-full bg-accent" />
                                )}
                            </button>
                        );
                    })}

                    {/* Add Button */}
                    <button
                        onClick={onAddClick}
                        className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground"
                    >
                        <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-muted-foreground/20">
                            <Plus size={16} strokeWidth={3} />
                        </div>
                        <span className="text-[0.6rem] font-medium">作成</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
