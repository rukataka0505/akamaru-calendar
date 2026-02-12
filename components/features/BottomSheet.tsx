"use client";

import React, { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
    X,
    Clock,
    CalendarDays,
    Palette,
    MapPin,
    Link2,
    StickyNote,
    CheckSquare,
    Repeat,
    Hash,
    Bell,
    Users,
    Paperclip,
    BookmarkPlus,
    ChevronRight,
    Camera,
} from "lucide-react";
import {
    CalendarEvent,
    CalendarInfo,
    EVENT_COLORS,
    EVENT_COLOR_LABELS,
    EventColor,
} from "@/lib/types";
import RecordForm, { RecordData } from "./RecordForm";

type SheetTab = "event" | "record";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    calendars: CalendarInfo[];
    onSaveEvent: (event: Omit<CalendarEvent, "id">) => void;
    onSaveRecord: (record: RecordData) => void;
}

export default function BottomSheet({
    isOpen,
    onClose,
    selectedDate,
    calendars,
    onSaveEvent,
    onSaveRecord,
}: BottomSheetProps) {
    const [activeTab, setActiveTab] = useState<SheetTab>("event");
    const [title, setTitle] = useState("");
    const [allDay, setAllDay] = useState(false);
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [startTime, setStartTime] = useState("14:00");
    const [endTime, setEndTime] = useState("15:00");
    const [selectedCalendar, setSelectedCalendar] = useState<CalendarInfo | null>(null);
    const [selectedColor, setSelectedColor] = useState<EventColor>("emerald");
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [memo, setMemo] = useState(false);

    useEffect(() => {
        if (selectedDate) {
            setStartDate(selectedDate);
            setEndDate(selectedDate);
        }
        if (calendars.length > 0) {
            setSelectedCalendar(calendars.find((c) => c.isDefault) || calendars[0]);
        }
    }, [selectedDate, calendars]);

    // Reset form when sheet closes
    useEffect(() => {
        if (!isOpen) {
            setTitle("");
            setAllDay(false);
            setStartTime("14:00");
            setEndTime("15:00");
            setMemo(false);
            setShowColorPicker(false);
        }
    }, [isOpen]);

    const handleSaveEvent = () => {
        if (!title.trim()) return;

        const [startH, startM] = startTime.split(":").map(Number);
        const [endH, endM] = endTime.split(":").map(Number);

        const start = new Date(startDate);
        if (!allDay) start.setHours(startH, startM);

        const end = new Date(endDate);
        if (!allDay) end.setHours(endH, endM);

        onSaveEvent({
            title,
            start,
            end,
            allDay,
            color: EVENT_COLORS[selectedColor],
            calendarId: selectedCalendar?.id || "cal-1",
            calendarName: selectedCalendar?.name || "恋人",
        });
        onClose();
    };

    return (
        <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex max-h-[92vh] flex-col rounded-t-2xl bg-white outline-none">
                    {/* Drag Handle */}
                    <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border" />

                    {/* Header with Tabs */}
                    <div className="flex items-center justify-between px-4 pt-3 pb-0">
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 transition-colors hover:bg-muted active:bg-border"
                        >
                            <X size={22} className="text-muted-foreground" />
                        </button>

                        {/* Tab Switcher */}
                        <div className="flex rounded-lg bg-muted p-0.5">
                            <button
                                onClick={() => setActiveTab("event")}
                                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === "event"
                                        ? "bg-white text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <CalendarDays size={14} />
                                予定
                            </button>
                            <button
                                onClick={() => setActiveTab("record")}
                                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === "record"
                                        ? "bg-white text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Camera size={14} />
                                記録
                            </button>
                        </div>

                        {activeTab === "event" ? (
                            <button
                                onClick={handleSaveEvent}
                                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${title.trim()
                                        ? "bg-accent text-white active:bg-accent/80"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                disabled={!title.trim()}
                            >
                                保存
                            </button>
                        ) : (
                            <div className="w-[60px]" /> /* Spacer to balance layout */
                        )}
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto px-4 pb-8 pt-3">
                        {activeTab === "event" ? (
                            /* ============= EVENT FORM ============= */
                            <>
                                {/* Title */}
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="タイトル"
                                    className="w-full text-xl font-bold text-foreground placeholder:text-border outline-none py-2 border-b border-border"
                                    autoFocus
                                />

                                {/* All Day Toggle */}
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <Clock size={18} className="text-accent" />
                                        <span className="text-sm text-foreground">終日</span>
                                    </div>
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            checked={allDay}
                                            onChange={(e) => setAllDay(e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="h-6 w-11 rounded-full bg-border transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-accent peer-checked:after:translate-x-5" />
                                    </label>
                                </div>

                                {/* Start Date/Time */}
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <CalendarDays size={18} className="text-accent" />
                                        <span className="text-sm text-foreground">開始</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-lg bg-accent-light px-3 py-1 text-sm font-medium text-accent">
                                            {format(startDate, "yyyy年M月d日 (E)", { locale: ja })}
                                        </span>
                                        {!allDay && (
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="rounded-lg bg-accent-light px-3 py-1 text-sm font-medium text-accent outline-none"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* End Date/Time */}
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <CalendarDays size={18} className="text-accent" />
                                        <span className="text-sm text-foreground">終了</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-lg bg-accent-light px-3 py-1 text-sm font-medium text-accent">
                                            {format(endDate, "yyyy年M月d日 (E)", { locale: ja })}
                                        </span>
                                        {!allDay && (
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="rounded-lg bg-accent-light px-3 py-1 text-sm font-medium text-accent outline-none"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Memo toggle */}
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <BookmarkPlus size={18} className="text-accent" />
                                        <span className="text-sm text-foreground">メモに保存する</span>
                                    </div>
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            checked={memo}
                                            onChange={(e) => setMemo(e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="h-6 w-11 rounded-full bg-border transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-accent peer-checked:after:translate-x-5" />
                                    </label>
                                </div>

                                {/* Calendar Selection */}
                                <button className="flex w-full items-center justify-between py-3 border-b border-border active:bg-muted transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Users size={18} className="text-accent" />
                                        <span className="text-sm text-foreground">
                                            {selectedCalendar?.name || "カレンダー"}
                                        </span>
                                    </div>
                                    <ChevronRight size={16} className="text-muted-foreground" />
                                </button>

                                {/* Color Selection */}
                                <button
                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                    className="flex w-full items-center justify-between py-3 border-b border-border active:bg-muted transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Palette size={18} className="text-accent" />
                                        <span className="text-sm text-foreground">
                                            {EVENT_COLOR_LABELS[selectedColor]}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="h-4 w-4 rounded-full"
                                            style={{ backgroundColor: EVENT_COLORS[selectedColor] }}
                                        />
                                        <ChevronRight size={16} className="text-muted-foreground" />
                                    </div>
                                </button>

                                {showColorPicker && (
                                    <div className="flex flex-wrap gap-3 py-3 px-2 border-b border-border">
                                        {(Object.keys(EVENT_COLORS) as EventColor[]).map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    setSelectedColor(color);
                                                    setShowColorPicker(false);
                                                }}
                                                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedColor === color ? "ring-2 ring-accent ring-offset-2" : ""
                                                    }`}
                                                style={{
                                                    backgroundColor: EVENT_COLORS[color] + "20",
                                                    color: EVENT_COLORS[color],
                                                }}
                                            >
                                                <span
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: EVENT_COLORS[color] }}
                                                />
                                                {EVENT_COLOR_LABELS[color]}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Reminder */}
                                <button className="flex w-full items-center justify-between py-3 border-b border-border active:bg-muted transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Bell size={18} className="text-accent" />
                                        <span className="text-sm text-foreground">10分前</span>
                                    </div>
                                    <ChevronRight size={16} className="text-muted-foreground" />
                                </button>

                                {/* Quick Action Tags */}
                                <div className="flex flex-wrap gap-2 py-4">
                                    {[
                                        { icon: Repeat, label: "繰り返し" },
                                        { icon: Hash, label: "日数カウント" },
                                        { icon: MapPin, label: "場所" },
                                    ].map(({ icon: Icon, label }) => (
                                        <button
                                            key={label}
                                            className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors active:bg-border"
                                        >
                                            <Icon size={14} />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Bottom Links */}
                                <div className="flex flex-wrap gap-4 pb-4 text-muted-foreground">
                                    {[
                                        { icon: Link2, label: "URL" },
                                        { icon: StickyNote, label: "メモ" },
                                        { icon: CheckSquare, label: "チェックリスト" },
                                    ].map(({ icon: Icon, label }) => (
                                        <button
                                            key={label}
                                            className="flex items-center gap-1 text-xs transition-colors active:text-foreground"
                                        >
                                            <Icon size={14} />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Attachment */}
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pb-6">
                                    <Paperclip size={14} />
                                    <span>添付ファイル</span>
                                </div>
                            </>
                        ) : (
                            /* ============= RECORD FORM ============= */
                            <RecordForm
                                selectedDate={selectedDate}
                                onSave={(record) => {
                                    onSaveRecord(record);
                                    onClose();
                                }}
                            />
                        )}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
