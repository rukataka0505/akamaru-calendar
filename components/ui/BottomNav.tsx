"use client";

import React from "react";
import { CalendarDays, Image } from "lucide-react";

type TabType = "calendar" | "album";

interface BottomNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const tabs: { id: TabType; label: string; icon: typeof CalendarDays }[] = [
        { id: "calendar", label: "カレンダー", icon: CalendarDays },
        { id: "album", label: "アルバム", icon: Image },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto">
            <div className="nav-glass border-t border-white/10">
                <div className="flex items-center justify-around py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
                    {tabs.map(({ id, label, icon: Icon }) => {
                        const isActive = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => onTabChange(id)}
                                className={`
                  flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-xl transition-all duration-200
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
                </div>
            </div>
        </nav>
    );
}
