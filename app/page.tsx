"use client";

import React, { useState, useCallback, useEffect } from "react";
import { isSameDay } from "date-fns";
import { Plus } from "lucide-react";
import MonthView from "@/components/calendar/MonthView";
import DayDetailDrawer from "@/components/calendar/DayDetailDrawer";
import BottomSheet from "@/components/features/BottomSheet";

import AlbumTimeline from "@/components/album/AlbumTimeline";
import MediaFeed from "@/components/album/MediaFeed";
import BottomNav from "@/components/ui/BottomNav";
import {
  getEventsForMonth,
  createEvent,
  updateEvent,
  MOCK_CALENDARS,
} from "@/lib/mockCalendarService";
import { CalendarEvent, CalendarInfo, UploadedBy } from "@/lib/types";

type AppTab = "calendar" | "album";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<AppTab>("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars] = useState<CalendarInfo[]>(MOCK_CALENDARS);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [currentUserId] = useState<UploadedBy>("user-1");

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

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setIsSheetOpen(true);
  }, []);

  const handleUpdateEvent = useCallback(
    async (updatedEvent: CalendarEvent) => {
      const result = await updateEvent(updatedEvent);
      setEvents((prev) => prev.map((e) => (e.id === result.id ? result : e)));
      setEditingEvent(null);
    },
    []
  );



  const handleOpenSheet = useCallback(() => {
    setEditingEvent(null);
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

        <div className="flex flex-col h-[calc(100dvh-5rem)] overflow-hidden relative bg-white">
          <div
            className="flex-1 overflow-y-auto w-full no-scrollbar bg-white"
            onClick={() => {
              if (isSheetOpen) setIsSheetOpen(false);
            }}
          >
            <MonthView
              month={currentMonth}
              selectedDate={selectedDate}
              events={events}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
            />
            {/* Spacer to allow scrolling past the drawer */}
            <div className={`w-full transition-all duration-300 ${selectedDate ? "h-[45vh]" : "h-0"}`} />
          </div>

          {/* Day Detail Panel */}
          {selectedDate && !isSheetOpen && (
            <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
              <DayDetailDrawer
                selectedDate={selectedDate}
                events={events}
                onAddEvent={handleOpenSheet}
                onEditEvent={handleEditEvent}
                onClose={() => setSelectedDate(null)}
              />
            </div>
          )}

          <BottomSheet
            isOpen={isSheetOpen}
            onClose={() => { setIsSheetOpen(false); setEditingEvent(null); }}
            selectedDate={selectedDate}
            calendars={calendars}
            onSaveEvent={handleSaveEvent}
            editingEvent={editingEvent}
            onUpdateEvent={handleUpdateEvent}
          />
        </div>
      )}

      {/* Album Tab */}
      {activeTab === "album" && (
        <>
          <AlbumTimeline
            favorites={favorites}
            onOpenFeed={handleOpenFeed}
            currentUserId={currentUserId}
          />
        </>
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
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={handleOpenSheet}
      />
    </div>
  );
}
