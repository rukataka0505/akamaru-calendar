"use client";

import React from "react";

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

export default function Switch({ checked, onChange, className = "" }: SwitchProps) {
    return (
        <div
            className={`relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${checked ? "bg-[#34C759]" : "bg-[#E9E9EA]"
                } ${className}`}
            onClick={() => onChange(!checked)}
        >
            <span className="sr-only">Use setting</span>
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-[20px]" : "translate-x-[2px]"
                    }`}
            />
        </div>
    );
}
