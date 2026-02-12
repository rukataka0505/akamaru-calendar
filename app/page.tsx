"use client";

import React, { useState, useCallback, useEffect } from "react";
import { isSameDay } from "date-fns";
import { Plus } from "lucide-react";
import MonthView from "@/components/calendar/MonthView";
import DayDetail from "@/components/calendar/DayDetail";
import BottomSheet from "@/components/features/BottomSheet";
import { RecordData } from "@/components/features/RecordForm";
import AlbumTimeline from "@/components/album/AlbumTimeline";
import MediaFeed from "@/components/album/MediaFeed";
import BottomNav from "@/components/ui/BottomNav";
import {
  getEventsForMonth,
  createEvent,
  MOCK_CALENDARS,
} from "@/lib/mockCalendarService";
import { CalendarEvent, CalendarInfo } from "@/lib/types";

type AppTab = "calendar" | "album";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<AppTab>("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars] = useState<CalendarInfo[]>(MOCK_CALENDARS);

  // Album state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [feedDateKey, setFeedDateKey] = useState<string | null>(null);

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

  // Calendar handlers
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
    console.log("Record saved (mock):", record);
    alert(`記録を保存しました: ${record.photos.length}枚の写真`);
  }, []);

  const handleOpenSheet = useCallback(() => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
    setIsSheetOpen(true);
  }, [selectedDate]);

  // Album handlers
  const handleToggleFavorite = useCallback((mediaId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(mediaId)) {
        next.delete(mediaId);
      } else {
        next.add(mediaId);
      }
      return next;
    });
  }, []);

  const handleOpenFeed = useCallback((dateKey: string) => {
    setFeedDateKey(dateKey);
  }, []);

  const handleCloseFeed = useCallback(() => {
    setFeedDateKey(null);
  }, []);

  return (
    <div className="relative flex flex-col min-h-[100dvh] bg-white max-w-md mx-auto">
      {/* Calendar Tab */}
      {activeTab === "calendar" && (
        <>
          <MonthView
            month={currentMonth}
            selectedDate={selectedDate}
            events={events}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
          />

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
            className="fixed bottom-20 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-white shadow-lg transition-all active:scale-95 hover:shadow-xl"
            aria-label="追加"
          >
            <Plus size={28} strokeWidth={2} />
          </button>

          <BottomSheet
            isOpen={isSheetOpen}
            onClose={() => setIsSheetOpen(false)}
            selectedDate={selectedDate}
            calendars={calendars}
            onSaveEvent={handleSaveEvent}
            onSaveRecord={handleSaveRecord}
          />
        </>
      )}

      {/* Album Tab */}
      {activeTab === "album" && (
        <AlbumTimeline
          favorites={favorites}
          onOpenFeed={handleOpenFeed}
        />
      )}

      {/* Media Feed Overlay */}
      {feedDateKey && (
        <MediaFeed
          dateKey={feedDateKey}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onClose={handleCloseFeed}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
