"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Drawer } from "vaul";
import { format, getDaysInMonth, set } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronRight, Clock } from "lucide-react";
import {
    CalendarEvent,
    EVENT_COLORS,
    EventColor,
    RecurrenceRule,
    RecurrenceFrequency,
} from "@/lib/types";
import RepeatCalendarModal from "./RepeatCalendarModal";
import RecurrenceModal from "./RecurrenceModal";
import Switch from "../ui/Switch";
import WheelPicker from "../ui/WheelPicker";

const FREQUENCY_DISPLAY: Record<RecurrenceFrequency, string> = {
    none: "なし",
    daily: "毎日",
    weekly: "毎週",
    monthly: "毎月",
    yearly: "毎年",
};

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
    // Time strings "HH:mm"
    const [startTime, setStartTime] = useState("21:00");
    const [endTime, setEndTime] = useState("22:00");
    const [selectedCalendar, setSelectedCalendar] = useState<{ id: string; name: string; isDefault?: boolean } | null>(null);
    const [selectedColor, setSelectedColor] = useState<EventColor>("emerald");
    const [location, setLocation] = useState("");
    const [url, setUrl] = useState("");
    const [memo, setMemo] = useState("");
    const [repeatDates, setRepeatDates] = useState<Date[]>([]);
    const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);
    const [recurrence, setRecurrence] = useState<RecurrenceRule>({ frequency: 'none', interval: 1 });
    const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);

    // Picker State
    const [pickerState, setPickerState] = useState<{ field: 'start' | 'end'; type: 'date' | 'time' } | null>(null);

    // Generate Picker Options
    const years = useMemo(() => Array.from({ length: 11 }, (_, i) => {
        const y = new Date().getFullYear() - 5 + i;
        return { label: `${y}年`, value: y };
    }), []);
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, value: i + 1 })), []);
    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: i })), []);
    const minutes = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ label: String(i * 5).padStart(2, '0'), value: i * 5 })), []);

    // Prefill form
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
            setRecurrence(editingEvent.recurrence || { frequency: 'none', interval: 1 });
            if (calendars.length > 0) {
                setSelectedCalendar(calendars.find((c) => c.id === editingEvent.calendarId) || calendars[0]);
            }
        } else if (isOpen) {
            if (selectedDate) {
                setStartDate(selectedDate);
                setEndDate(selectedDate);

                // Initialize time from selectedDate
                const h = selectedDate.getHours();
                const m = selectedDate.getMinutes();
                const startStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                setStartTime(startStr);

                // Default end time is +1 hour
                const endH = (h + 1) % 24;
                const endStr = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                setEndTime(endStr);
            }
            if (calendars.length > 0) {
                setSelectedCalendar(calendars.find((c) => c.isDefault) || calendars[0]);
            }
        }
    }, [isOpen, editingEvent, selectedDate, calendars]);

    // Reset form
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
            setRecurrence({ frequency: 'none', interval: 1 });
            setPickerState(null);
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
            recurrence: recurrence.frequency !== 'none' ? recurrence : undefined,
        };

        if (editingEvent && onUpdateEvent) {
            onUpdateEvent({ ...editingEvent, ...eventData });
        } else {
            onSaveEvent(eventData);
        }
        onClose();
    };

    // Helper to update Date
    const updateDate = (field: 'start' | 'end', type: 'year' | 'month' | 'day', value: number) => {
        const currentDate = field === 'start' ? startDate : endDate;
        const newDate = new Date(currentDate);

        if (type === 'year') newDate.setFullYear(value);
        if (type === 'month') newDate.setMonth(value - 1); // 0-indexed
        if (type === 'day') newDate.setDate(value);

        if (field === 'start') setStartDate(newDate);
        else setEndDate(newDate);
    };

    // Helper to update Time
    const updateTime = (field: 'start' | 'end', type: 'hour' | 'minute', value: number) => {
        const currentString = field === 'start' ? startTime : endTime;
        const [h, m] = currentString.split(':').map(Number);

        let newH = h;
        let newM = m;

        if (type === 'hour') newH = value;
        if (type === 'minute') newM = value;

        const newString = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;

        if (field === 'start') setStartTime(newString);
        else setEndTime(newString);
    };

    const renderPicker = () => {
        if (!pickerState) return null;

        const { field, type } = pickerState;
        const date = field === 'start' ? startDate : endDate;
        const timeString = field === 'start' ? startTime : endTime;

        if (type === 'date') {
            const currentYear = date.getFullYear();
            const currentMonth = date.getMonth() + 1;
            const currentDay = date.getDate();
            const daysInMonth = getDaysInMonth(date);
            const daysOptions = Array.from({ length: daysInMonth }, (_, i) => ({ label: `${i + 1}日`, value: i + 1 }));

            return (
                <div className="flex w-full px-2 py-1">
                    <div className="flex-1">
                        <WheelPicker items={years} selectedValue={currentYear} onChange={(v) => updateDate(field, 'year', v as number)} />
                    </div>
                    <div className="flex-1">
                        <WheelPicker items={months} selectedValue={currentMonth} onChange={(v) => updateDate(field, 'month', v as number)} />
                    </div>
                    <div className="flex-1">
                        <WheelPicker items={daysOptions} selectedValue={currentDay} onChange={(v) => updateDate(field, 'day', v as number)} />
                    </div>
                </div>
            );
        } else {
            const [currentHour, currentMinute] = timeString.split(':').map(Number);
            // Snap current minute to nearest 5 for initial selection if needed, 
            // but the picker will just highlight the closest or exact match. 
            // Since we generated minutes in 5-min steps, we should round currentMinute to nearest 5 for display sync if it's off.
            // But let's assume it's fine for now or handle it.
            const roundedMinute = Math.round(currentMinute / 5) * 5;

            return (
                <div className="flex w-full px-2 py-1 gap-2">
                    <div className="flex-1">
                        <WheelPicker items={hours} selectedValue={currentHour} onChange={(v) => updateTime(field, 'hour', v as number)} />
                    </div>
                    <div className="flex-1">
                        <WheelPicker items={minutes} selectedValue={roundedMinute} onChange={(v) => updateTime(field, 'minute', v as number)} />
                    </div>
                </div>
            );
        }
    };

    const togglePicker = (field: 'start' | 'end', type: 'date' | 'time') => {
        if (pickerState?.field === field && pickerState?.type === type) {
            setPickerState(null); // Close if same clicked
        } else {
            setPickerState({ field, type });
        }
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
                                    <Switch checked={allDay} onChange={(val) => {
                                        setAllDay(val);
                                        if (val && pickerState?.type === 'time') {
                                            setPickerState(null);
                                        }
                                    }} />
                                </div>

                                {/* Start Date/Time */}
                                <div className="section-row">
                                    <span className="text-[16px] text-black">開始</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => togglePicker('start', 'date')}
                                            className={`ios-date-btn ${pickerState?.field === 'start' && pickerState?.type === 'date' ? 'text-accent bg-accent/10' : ''}`}
                                        >
                                            {format(startDate, "yyyy年M月d日(E)", { locale: ja })}
                                        </button>
                                        {!allDay && (
                                            <button
                                                onClick={() => togglePicker('start', 'time')}
                                                className={`ios-date-btn ${pickerState?.field === 'start' && pickerState?.type === 'time' ? 'text-accent bg-accent/10' : ''}`}
                                            >
                                                {startTime}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {pickerState?.field === 'start' && (
                                    <div className="border-t border-gray-100 transition-all duration-300 ease-in-out">
                                        {renderPicker()}
                                    </div>
                                )}

                                {/* End Date/Time */}
                                <div className="section-row">
                                    <span className="text-[16px] text-black">終了</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => togglePicker('end', 'date')}
                                            className={`ios-date-btn ${pickerState?.field === 'end' && pickerState?.type === 'date' ? 'text-accent bg-accent/10' : ''}`}
                                        >
                                            {format(endDate, "yyyy年M月d日(E)", { locale: ja })}
                                        </button>
                                        {!allDay && (
                                            <button
                                                onClick={() => togglePicker('end', 'time')}
                                                className={`ios-date-btn ${pickerState?.field === 'end' && pickerState?.type === 'time' ? 'text-accent bg-accent/10' : ''}`}
                                            >
                                                {endTime}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {pickerState?.field === 'end' && (
                                    <div className="border-t border-gray-100 transition-all duration-300 ease-in-out">
                                        {renderPicker()}
                                    </div>
                                )}
                            </div>

                            {/* Section 4: Options */}
                            <div className="section-card">
                                {/* Multiple Days - 複数日 */}
                                <div
                                    className="section-row nav-row"
                                    onClick={() => setIsRepeatModalOpen(true)}
                                >
                                    <span className="text-[16px] text-black">複数日</span>
                                    <div className="flex items-center">
                                        <span className="text-[16px] text-gray-400">
                                            {repeatDates.length > 0 ? `${repeatDates.length}日選択` : "なし"}
                                        </span>
                                        <ChevronRight size={16} className="nav-chevron" />
                                    </div>
                                </div>

                                {/* Repeat - 繰り返し */}
                                <div
                                    className="section-row nav-row"
                                    onClick={() => setIsRecurrenceModalOpen(true)}
                                >
                                    <span className="text-[16px] text-black">繰り返し</span>
                                    <div className="flex items-center">
                                        <span className="text-[16px] text-gray-400">
                                            {FREQUENCY_DISPLAY[recurrence.frequency]}
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

            {/* Multiple Days Calendar Modal */}
            <RepeatCalendarModal
                isOpen={isRepeatModalOpen}
                onClose={() => setIsRepeatModalOpen(false)}
                selectedDates={repeatDates}
                onDatesChange={setRepeatDates}
                eventTitle={title}
                eventColor={EVENT_COLORS[selectedColor]}
                baseDate={startDate}
            />

            {/* Recurrence Setting Modal */}
            <RecurrenceModal
                isOpen={isRecurrenceModalOpen}
                onClose={() => setIsRecurrenceModalOpen(false)}
                recurrence={recurrence}
                onRecurrenceChange={setRecurrence}
            />
        </>
    );
}
