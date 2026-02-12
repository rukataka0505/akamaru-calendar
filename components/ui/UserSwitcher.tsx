"use strict";
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UploadedBy, USER_PROFILES } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UserContextType {
    currentUserId: UploadedBy;
    setCurrentUserId: (userId: UploadedBy) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currentUserId, setCurrentUserId] = useState<UploadedBy>("user-1");

    useEffect(() => {
        const saved = localStorage.getItem("app-user-id") as UploadedBy;
        if (saved && (saved === "user-1" || saved === "user-2")) {
            setCurrentUserId(saved);
        }
    }, []);

    const handleSetUser = (userId: UploadedBy) => {
        setCurrentUserId(userId);
        localStorage.setItem("app-user-id", userId);
    };

    return (
        <UserContext.Provider value={{ currentUserId, setCurrentUserId: handleSetUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}

export function UserSwitcher({ className }: { className?: string }) {
    const { currentUserId, setCurrentUserId } = useUser();

    return (
        <div className={cn("flex bg-gray-100 p-1 rounded-full", className)}>
            {(Object.keys(USER_PROFILES) as UploadedBy[]).map((userId) => {
                const profile = USER_PROFILES[userId];
                const isActive = currentUserId === userId;
                return (
                    <button
                        key={userId}
                        onClick={() => setCurrentUserId(userId)}
                        className={cn(
                            "px-3 py-1 text-sm font-medium rounded-full transition-all duration-200",
                            isActive
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <span
                            className="inline-block w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: profile.color }}
                        />
                        {profile.name}
                    </button>
                );
            })}
        </div>
    );
}
