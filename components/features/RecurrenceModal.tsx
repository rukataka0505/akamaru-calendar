"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Drawer } from "vaul";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
    RecurrenceRule,
    RecurrenceFrequency,
    Weekday,
} from "@/lib/types";

interface RecurrenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    recurrence: RecurrenceRule;
    onRecurrenceChange: (rule: RecurrenceRule) => void;
}

const FREQUENCY_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
    { value: "none", label: "なし" },
    { value: "daily", label: "毎日" },
    { value: "weekly", label: "毎週" },
    { value: "monthly", label: "毎月" },
    { value: "yearly", label: "毎年" },
];

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
    none: "なし",
    daily: "毎日",
    weekly: "毎週",
    monthly: "毎月",
    yearly: "毎年",
};

const WEEKDAY_OPTIONS: { value: Weekday; label: string }[] = [
    { value: "sun", label: "日曜日" },
    { value: "mon", label: "月曜日" },
    { value: "tue", label: "火曜日" },
    { value: "wed", label: "水曜日" },
    { value: "thu", label: "木曜日" },
    { value: "fri", label: "金曜日" },
    { value: "sat", label: "土曜日" },
];

type SubView = "main" | "endDate" | "interval" | "weekdays";

export default function RecurrenceModal({
    isOpen,
    onClose,
    recurrence,
    onRecurrenceChange,
}: RecurrenceModalProps) {
    const [subView, setSubView] = useState<SubView>("main");
    const [tempEndDate, setTempEndDate] = useState<string>(
        recurrence.endDate ? format(recurrence.endDate, "yyyy-MM-dd") : ""
    );

    const handleFrequencyChange = useCallback(
        (freq: RecurrenceFrequency) => {
            const updated: RecurrenceRule = {
                ...recurrence,
                frequency: freq,
                interval: freq === "none" ? 1 : recurrence.interval,
                weekdays: freq === "weekly" ? (recurrence.weekdays || ["sat"]) : undefined,
            };
            onRecurrenceChange(updated);
        },
        [recurrence, onRecurrenceChange]
    );

    const handleIntervalChange = useCallback(
        (interval: number) => {
            onRecurrenceChange({ ...recurrence, interval: Math.max(1, interval) });
        },
        [recurrence, onRecurrenceChange]
    );

    const handleEndDateChange = useCallback(
        (dateStr: string) => {
            setTempEndDate(dateStr);
            if (dateStr) {
                onRecurrenceChange({ ...recurrence, endDate: new Date(dateStr) });
            } else {
                const { endDate, ...rest } = recurrence;
                onRecurrenceChange({ ...rest, endDate: undefined });
            }
        },
        [recurrence, onRecurrenceChange]
    );

    const handleWeekdayToggle = useCallback(
        (day: Weekday) => {
            const current = recurrence.weekdays || [];
            const isSelected = current.includes(day);
            let updated: Weekday[];
            if (isSelected) {
                updated = current.filter((d) => d !== day);
                if (updated.length === 0) return; // 最低1つは必要
            } else {
                updated = [...current, day];
            }
            onRecurrenceChange({ ...recurrence, weekdays: updated });
        },
        [recurrence, onRecurrenceChange]
    );

    const selectedWeekdaysLabel = useMemo(() => {
        if (!recurrence.weekdays || recurrence.weekdays.length === 0) return "";
        if (recurrence.weekdays.length === 7) return "毎日";
        return recurrence.weekdays
            .map((w) => WEEKDAY_OPTIONS.find((o) => o.value === w)?.label.replace("曜日", "") || "")
            .join("・") + "曜日";
    }, [recurrence.weekdays]);

    const handleClose = useCallback(() => {
        setSubView("main");
        onClose();
    }, [onClose]);

    // ── Sub-view: 繰り返し期限 ──
    if (subView === "endDate") {
        return (
            <Drawer.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40" />
                    <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[70] flex max-h-[95vh] flex-col rounded-t-xl bg-[#F2F2F7] outline-none">
                        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-300" />
                        <div className="flex items-center px-4 pb-2 pt-2">
                            <button
                                onClick={() => setSubView("main")}
                                className="flex items-center text-[17px] text-accent transition-opacity active:opacity-50"
                            >
                                <ChevronLeft size={20} />
                                <span>戻る</span>
                            </button>
                            <span className="flex-1 text-center text-[17px] font-semibold text-black">繰り返し期限</span>
                            <div className="w-14" />
                        </div>

                        <div className="flex-1 overflow-y-auto pb-10">
                            <div className="section-card">
                                <div
                                    className="section-row nav-row"
                                    onClick={() => handleEndDateChange("")}
                                >
                                    <span className="text-[16px] text-black">なし</span>
                                    {!tempEndDate && <Check size={18} className="text-accent" />}
                                </div>
                                <div className="section-row">
                                    <span className="text-[16px] text-black">日付を指定</span>
                                    <input
                                        type="date"
                                        value={tempEndDate}
                                        onChange={(e) => handleEndDateChange(e.target.value)}
                                        className="text-[16px] text-accent bg-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        );
    }

    // ── Sub-view: 曜日選択 ──
    if (subView === "weekdays") {
        return (
            <Drawer.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40" />
                    <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[70] flex max-h-[95vh] flex-col rounded-t-xl bg-[#F2F2F7] outline-none">
                        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-300" />
                        <div className="flex items-center px-4 pb-2 pt-2">
                            <button
                                onClick={() => setSubView("main")}
                                className="flex items-center text-[17px] text-accent transition-opacity active:opacity-50"
                            >
                                <ChevronLeft size={20} />
                                <span>戻る</span>
                            </button>
                            <span className="flex-1 text-center text-[17px] font-semibold text-black">曜日</span>
                            <div className="w-14" />
                        </div>

                        <div className="flex-1 overflow-y-auto pb-10">
                            <div className="section-card">
                                {WEEKDAY_OPTIONS.map((opt) => {
                                    const isSelected = (recurrence.weekdays || []).includes(opt.value);
                                    return (
                                        <div
                                            key={opt.value}
                                            className="section-row nav-row"
                                            onClick={() => handleWeekdayToggle(opt.value)}
                                        >
                                            <span className="text-[16px] text-black">{opt.label}</span>
                                            {isSelected && <Check size={18} className="text-accent" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        );
    }

    // ── Main view ──
    return (
        <Drawer.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[70] flex max-h-[95vh] flex-col rounded-t-xl bg-[#F2F2F7] outline-none">
                    <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-300" />

                    {/* Header */}
                    <div className="flex items-center px-4 pb-2 pt-2">
                        <button
                            onClick={handleClose}
                            className="flex items-center text-[17px] text-accent transition-opacity active:opacity-50"
                        >
                            <ChevronLeft size={20} />
                            <span>戻る</span>
                        </button>
                        <span className="flex-1 text-center text-[17px] font-semibold text-black">繰り返し</span>
                        <div className="w-14" />
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto pb-10">
                        {/* Frequency Selection */}
                        <div className="section-card">
                            {FREQUENCY_OPTIONS.map((opt) => (
                                <div
                                    key={opt.value}
                                    className="section-row nav-row"
                                    onClick={() => handleFrequencyChange(opt.value)}
                                >
                                    <span className="text-[16px] text-black">{opt.label}</span>
                                    {recurrence.frequency === opt.value && (
                                        <Check size={18} className="text-accent" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Detail Settings — visible if frequency != 'none' */}
                        {recurrence.frequency !== "none" && (
                            <>
                                <div className="section-card">
                                    {/* End Date */}
                                    <div
                                        className="section-row nav-row"
                                        onClick={() => setSubView("endDate")}
                                    >
                                        <span className="text-[16px] text-black">繰り返し期限</span>
                                        <div className="flex items-center">
                                            <span className="text-[16px] text-gray-400">
                                                {recurrence.endDate
                                                    ? format(recurrence.endDate, "yyyy/M/d", { locale: ja })
                                                    : "なし"}
                                            </span>
                                            <ChevronRight size={16} className="nav-chevron" />
                                        </div>
                                    </div>

                                    {/* Interval */}
                                    <div className="section-row nav-row">
                                        <span className="text-[16px] text-black">次の間隔で繰り返す</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleIntervalChange(recurrence.interval - 1)}
                                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[16px] font-bold text-gray-600 active:bg-gray-300"
                                                disabled={recurrence.interval <= 1}
                                            >
                                                −
                                            </button>
                                            <span className="text-[16px] text-gray-700 min-w-[3rem] text-center">
                                                {recurrence.interval}{" "}
                                                {FREQUENCY_LABELS[recurrence.frequency]}
                                            </span>
                                            <button
                                                onClick={() => handleIntervalChange(recurrence.interval + 1)}
                                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[16px] font-bold text-gray-600 active:bg-gray-300"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Weekly Weekday Condition */}
                                {recurrence.frequency === "weekly" && (
                                    <>
                                        <p className="px-6 pt-4 pb-1 text-[13px] text-gray-500">
                                            週の繰り返し条件
                                        </p>
                                        <div className="section-card">
                                            <div
                                                className="section-row nav-row"
                                                onClick={() => setSubView("weekdays")}
                                            >
                                                <span className="text-[16px] text-black">曜日</span>
                                                <div className="flex items-center">
                                                    <span className="text-[16px] text-gray-400">
                                                        {selectedWeekdaysLabel}
                                                    </span>
                                                    <ChevronRight size={16} className="nav-chevron" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
