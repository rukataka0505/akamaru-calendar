"use client";

import React, { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronRight, Clock, MapPin, Link2, FileText, CalendarDays } from "lucide-react";
import {
    CalendarEvent,
    EVENT_COLORS,
    EVENT_COLOR_LABELS,
    EventColor,
} from "@/lib/types";
import RepeatCalendarModal from "./RepeatCalendarModal";

// hex → EventColor 名の逆引き
function hexToColorName(hex: string): EventColor {
    const entry = (Object.entries(EVENT_COLORS) as [EventColor, string][]).find(
        ([, v]) => v === hex
    );
    return entry ? entry[0] : "emerald";
}

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    calendars: { id: string; name: string; isDefault?: boolean }[];
    onSaveEvent: (event: Omit<CalendarEvent, "id">) => void;
    editingEvent?: CalendarEvent | null;
    onUpdateEvent?: (event: CalendarEvent) => void;
}

export default function BottomSheet({
    isOpen,
    onClose,
    selectedDate,
    calendars,
    onSaveEvent,
    editingEvent,
    onUpdateEvent,
}: BottomSheetProps) {
    const [title, setTitle] = useState("");
    const [allDay, setAllDay] = useState(false);
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [startTime, setStartTime] = useState("21:00");
    const [endTime, setEndTime] = useState("22:00");
    const [selectedCalendar, setSelectedCalendar] = useState<{ id: string; name: string; isDefault?: boolean } | null>(null);
    const [selectedColor, setSelectedColor] = useState<EventColor>("emerald");
    const [location, setLocation] = useState("");
    const [url, setUrl] = useState("");
    const [memo, setMemo] = useState("");
    const [repeatDates, setRepeatDates] = useState<Date[]>([]);
    const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);

    // Prefill form when editing or set defaults when creating
    useEffect(() => {
        if (isOpen && editingEvent) {
            setTitle(editingEvent.title);
            setAllDay(editingEvent.allDay);
            setStartDate(new Date(editingEvent.start));
            setEndDate(new Date(editingEvent.end));
            if (!editingEvent.allDay) {
                const s = new Date(editingEvent.start);
                const e = new Date(editingEvent.end);
                setStartTime(`${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(2, '0')}`);
                setEndTime(`${String(e.getHours()).padStart(2, '0')}:${String(e.getMinutes()).padStart(2, '0')}`);
            }
            setSelectedColor(hexToColorName(editingEvent.color));
            setLocation(editingEvent.location || "");
            setUrl(editingEvent.url || "");
            setMemo(editingEvent.memo || "");
            setRepeatDates(editingEvent.repeatDates || []);
            if (calendars.length > 0) {
                setSelectedCalendar(calendars.find((c) => c.id === editingEvent.calendarId) || calendars[0]);
            }
        } else if (isOpen) {
            if (selectedDate) {
                setStartDate(selectedDate);
                setEndDate(selectedDate);
            }
            if (calendars.length > 0) {
                setSelectedCalendar(calendars.find((c) => c.isDefault) || calendars[0]);
            }
        }
    }, [isOpen, editingEvent, selectedDate, calendars]);

    // Reset form when sheet closes
    useEffect(() => {
        if (!isOpen) {
            setTitle("");
            setAllDay(false);
            setStartTime("21:00");
            setEndTime("22:00");
            setLocation("");
            setUrl("");
            setMemo("");
            setRepeatDates([]);
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

        const eventData = {
            title,
            start,
            end,
            allDay,
            color: EVENT_COLORS[selectedColor],
            calendarId: selectedCalendar?.id || "cal-1",
            calendarName: selectedCalendar?.name || "カレンダー",
            location: location || undefined,
            url: url || undefined,
            memo: memo || undefined,
            repeatDates: repeatDates.length > 0 ? repeatDates : undefined,
        };

        if (editingEvent && onUpdateEvent) {
            onUpdateEvent({ ...editingEvent, ...eventData });
        } else {
            onSaveEvent(eventData);
        }
        onClose();
    };

    return (
        <>
            <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
                    <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-10 flex max-h-[95vh] flex-col rounded-t-xl bg-[#F2F2F7] outline-none">
                        {/* Drag Handle */}
                        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-300" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 pb-2 pt-2">
                            <button
                                onClick={onClose}
                                className="text-[17px] text-accent transition-opacity active:opacity-50"
                            >
                                キャンセル
                            </button>

                            <span className="text-[17px] font-semibold text-black">
                                {editingEvent ? "予定を編集" : "新しい予定"}
                            </span>

                            <button
                                onClick={handleSaveEvent}
                                className={`text-[17px] font-semibold transition-opacity ${title.trim()
                                    ? "text-accent active:opacity-50"
                                    : "text-gray-400"
                                    }`}
                                disabled={!title.trim()}
                            >
                                保存
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto pb-10">
                            {/* Section: Title */}
                            <div className="section-card">
                                <div className="section-row">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="タイトル"
                                        className="ios-input"
                                        autoFocus
                                    />
                                    <Clock size={20} className="text-gray-400 ml-2" />
                                </div>
                            </div>

                            {/* Section 3: Date & Time */}
                            <div className="section-card">
                                {/* All Day Toggle */}
                                <div className="section-row">
                                    <span className="text-[16px] text-black">終日予定</span>
                                    <input
                                        type="checkbox"
                                        className="ios-toggle"
                                        checked={allDay}
                                        onChange={(e) => setAllDay(e.target.checked)}
                                    />
                                </div>

                                {/* Start Date/Time */}
                                <div className="section-row">
                                    <span className="text-[16px] text-black">開始</span>
                                    <div className="flex items-center gap-2">
                                        <button className="ios-date-btn">
                                            {format(startDate, "yyyy年M月d日(E)", { locale: ja })}
                                        </button>
                                        {!allDay && (
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="ios-date-btn outline-none"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* End Date/Time */}
                                <div className="section-row">
                                    <span className="text-[16px] text-black">終了</span>
                                    <div className="flex items-center gap-2">
                                        <button className="ios-date-btn">
                                            {format(endDate, "yyyy年M月d日(E)", { locale: ja })}
                                        </button>
                                        {!allDay && (
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="ios-date-btn outline-none"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Options */}
                            <div className="section-card">
                                {/* Multiple Days */}
                                <div className="section-row nav-row">
                                    <span className="text-[16px] text-black">複数日</span>
                                    <div className="flex items-center">
                                        <span className="text-[16px] text-gray-400">なし</span>
                                        <ChevronRight size={16} className="nav-chevron" />
                                    </div>
                                </div>

                                {/* Repeat */}
                                <div
                                    className="section-row nav-row"
                                    onClick={() => setIsRepeatModalOpen(true)}
                                >
                                    <span className="text-[16px] text-black">繰り返し</span>
                                    <div className="flex items-center">
                                        <span className="text-[16px] text-gray-400">
                                            {repeatDates.length > 0 ? `${repeatDates.length}日選択` : "なし"}
                                        </span>
                                        <ChevronRight size={16} className="nav-chevron" />
                                    </div>
                                </div>

                                {/* Notification Alarm */}
                                <div className="section-row nav-row">
                                    <span className="text-[16px] text-black">通知アラーム</span>
                                    <div className="flex items-center">
                                        <span className="text-[16px] text-gray-400">なし</span>
                                        <ChevronRight size={16} className="nav-chevron" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Text Inputs */}
                            <div className="section-card">
                                {/* Component for input rows to ensure consistency */}
                                <div className="section-row">
                                    <div className="flex items-center justify-center w-8 mr-2">
                                        <span className="text-[16px] text-gray-400">場所</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder=""
                                        className="ios-input"
                                    />
                                </div>
                                <div className="section-row">
                                    <div className="flex items-center justify-center w-8 mr-2">
                                        <span className="text-[16px] text-gray-400">URL</span>
                                    </div>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder=""
                                        className="ios-input"
                                    />
                                </div>
                                <div className="section-row items-start">
                                    <div className="flex items-center justify-center w-8 mr-2 pt-1">
                                        <span className="text-[16px] text-gray-400">メモ</span>
                                    </div>
                                    <textarea
                                        value={memo}
                                        onChange={(e) => setMemo(e.target.value)}
                                        placeholder=""
                                        rows={3}
                                        className="ios-input resize-none py-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>

            {/* Repeat Calendar Modal */}
            <RepeatCalendarModal
                isOpen={isRepeatModalOpen}
                onClose={() => setIsRepeatModalOpen(false)}
                selectedDates={repeatDates}
                onDatesChange={setRepeatDates}
                eventTitle={title}
                eventColor={EVENT_COLORS[selectedColor]}
                baseDate={startDate}
            />
        </>
    );
}
