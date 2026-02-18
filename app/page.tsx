"use client";

import React, { useState, useCallback, useEffect } from "react";
import { isSameDay, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import MonthView from "@/components/calendar/MonthView";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import DayDetailDrawer from "@/components/calendar/DayDetailDrawer";
import BottomSheet from "@/components/features/BottomSheet";

import AlbumTimeline from "@/components/album/AlbumTimeline";
import MediaFeed from "@/components/album/MediaFeed";
import NotebookDashboard from "@/components/notebook/NotebookDashboard";
import BottomNav from "@/components/ui/BottomNav";
import {
  getEventsForMonth,
  createEvent,
  updateEvent,
} from "@/lib/calendarService";
import { MOCK_CALENDARS } from "@/lib/constants";
import { useUser } from "@/components/ui/UserSwitcher";
import { CalendarEvent, CalendarInfo, UploadedBy } from "@/lib/types";

type ViewType = "month" | "week" | "day" | "album" | "notebook";

export default function HomePage() {
  const [view, setView] = useState<ViewType>("month");
  const [currentDate, setCurrentDate] = useState(new Date()); // Tracks the currently viewed date/period
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars] = useState<CalendarInfo[]>(MOCK_CALENDARS);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const { currentUserId } = useUser();

  // Album state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [feedDateKey, setFeedDateKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      // Create a range based on view? 
      // For simplicity, fetch current month + prev/next month buffer if needed?
      // Or just fetch for currentDate's month.
      // Week view might span months.
      // Ideally fetch range. But getEventsForMonth takes year/month.
      // Let's fetch for the month of currentDate. 
      // If week crosses month, maybe fetch both? 
      // For now, simplify -> fetch current month.
      const data = await getEventsForMonth(
        currentDate.getFullYear(),
        currentDate.getMonth()
      );
      setEvents(data);
    };
    fetchEvents();
  }, [currentDate]);

  // Calendar Navigation
  const handlePrev = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === "month") return subMonths(prev, 1);
      if (view === "week") return subWeeks(prev, 1);
      if (view === "day") return subDays(prev, 1);
      return prev;
    });
  }, [view]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === "month") return addMonths(prev, 1);
      if (view === "week") return addWeeks(prev, 1);
      if (view === "day") return addDays(prev, 1);
      return prev;
    });
  }, [view]);

  const handleToday = useCallback(() => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(null); // Optional: select today?
  }, []);

  // Calendar Selection Handlers
  const handleDateSelect = useCallback(
    (date: Date) => {
      if (selectedDate && isSameDay(date, selectedDate)) {
        // In Month view, double tap (or second tap) opens sheet
        setIsSheetOpen(true);
      } else {
        setSelectedDate(date);
      }
    },
    [selectedDate]
  );

  const handleTimeSelect = useCallback((date: Date) => {
    if (selectedDate && date.getTime() === selectedDate.getTime()) {
      // Same time slot clicked again -> Open sheet
      setIsSheetOpen(true);
    } else {
      setSelectedDate(date);
    }
  }, [selectedDate]);


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
      {/* View Content */}
      <div className="flex flex-col h-[calc(100dvh-5rem)] overflow-hidden relative bg-white">

        {/* Calendar Header (Only for calendar views) */}
        {view !== "album" && (
          <CalendarHeader
            currentDate={currentDate}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
          />
        )}

        <div
          className="flex-1 overflow-y-auto w-full no-scrollbar bg-white"
          onClick={() => {
            // Close sheet if clicking backdrop? 
            // Actually no, sheet is a drawer.
            // Maybe clear edit state?
          }}
        >

          {view === "month" && (
            <>
              <MonthView
                month={currentDate}
                selectedDate={selectedDate}
                events={events} // Note: filtering happens in component usually, or here? MonthView filters date-fns
                onDateSelect={handleDateSelect}
                onMonthChange={setCurrentDate}
              />
              {/* Spacer to allow scrolling past the drawer IN MONTH VIEW */}
              <div className={`w-full transition-all duration-300 ${selectedDate ? "h-[45vh]" : "h-0"}`} />
            </>
          )}

          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              selectedDate={selectedDate}
              events={events}
              onTimeSelect={handleTimeSelect}
              onEventClick={handleEditEvent}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          )}

          {view === "day" && (
            <DayView
              currentDate={currentDate}
              selectedDate={selectedDate}
              events={events}
              onTimeSelect={handleTimeSelect}
              onEventClick={handleEditEvent}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          )}


          {view === "album" && (
            <AlbumTimeline
              favorites={favorites}
              onOpenFeed={handleOpenFeed}
              currentUserId={currentUserId}
            />
          )}

          {view === "notebook" && (
            <NotebookDashboard currentUserId={currentUserId} />
          )}

        </div>

        {/* Day Detail Panel (Only for Month View) */}
        {view === "month" && selectedDate && !isSheetOpen && (
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

      {/* Media Feed Overlay (Album) */}
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
        activeTab={view} // view matches TabType
        onTabChange={(tab: any) => {
          if (tab === "today") {
            handleToday();
            return;
          }
          if (tab === "month" || tab === "week" || tab === "day" || tab === "album" || tab === "notebook") {
            setView(tab);
          }
          // If we switch to calendar views, maybe reset currentDate to today or keep it?
          // Keep it is betterUX.
        }}
        onAddClick={handleOpenSheet}
      />
    </div>
  );
}
