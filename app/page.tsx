"use client";

import React, { useState, useCallback, useEffect } from "react";
import { isSameDay } from "date-fns";
import { Plus } from "lucide-react";
import MonthView from "@/components/calendar/MonthView";
import DayDetail from "@/components/calendar/DayDetail";
import BottomSheet from "@/components/features/BottomSheet";
import { RecordData } from "@/components/features/RecordForm";
import {
  getEventsForMonth,
  createEvent,
  MOCK_CALENDARS,
} from "@/lib/mockCalendarService";
import { CalendarEvent, CalendarInfo } from "@/lib/types";

export default function HomePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars] = useState<CalendarInfo[]>(MOCK_CALENDARS);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getEventsForMonth(
        currentMonth.getFullYear(),
        currentMonth.getMonth()
      );
      setEvents(data);
    };
    fetchEvents();
  }, [currentMonth]);

  // Tap to select, tap again to open sheet
  const handleDateSelect = useCallback(
    (date: Date) => {
      if (selectedDate && isSameDay(date, selectedDate)) {
        setIsSheetOpen(true);
      } else {
        setSelectedDate(date);
      }
    },
    [selectedDate]
  );

  const handleMonthChange = useCallback((date: Date) => {
    setCurrentMonth(date);
    setSelectedDate(null);
  }, []);

  const handleSaveEvent = useCallback(
    async (eventData: Omit<CalendarEvent, "id">) => {
      const newEvent = await createEvent(eventData);
      setEvents((prev) => [...prev, newEvent]);
    },
    []
  );

  const handleSaveRecord = useCallback((record: RecordData) => {
    // TODO: Upload to Google Drive via API route
    console.log("Record saved (mock):", record);
    alert(`記録を保存しました: ${record.photos.length}枚の写真`);
  }, []);

  const handleOpenSheet = useCallback(() => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
    setIsSheetOpen(true);
  }, [selectedDate]);

  return (
    <div className="relative flex flex-col min-h-[100dvh] bg-white max-w-md mx-auto">
      {/* Calendar */}
      <MonthView
        month={currentMonth}
        selectedDate={selectedDate}
        events={events}
        onDateSelect={handleDateSelect}
        onMonthChange={handleMonthChange}
      />

      {/* Day Detail */}
      {selectedDate && (
        <DayDetail
          date={selectedDate}
          events={events}
          onAddEvent={handleOpenSheet}
        />
      )}

      {/* FAB */}
      <button
        onClick={handleOpenSheet}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-white shadow-lg transition-all active:scale-95 hover:shadow-xl"
        aria-label="追加"
      >
        <Plus size={28} strokeWidth={2} />
      </button>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        selectedDate={selectedDate}
        calendars={calendars}
        onSaveEvent={handleSaveEvent}
        onSaveRecord={handleSaveRecord}
      />
    </div>
  );
}
