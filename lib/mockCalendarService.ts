import { CalendarEvent, CalendarInfo } from "./types";

// Mock calendars (simulates Google Calendar API)
export const MOCK_CALENDARS: CalendarInfo[] = [
    { id: "cal-1", name: "恋人", color: "#ef4444", isDefault: true },
    { id: "cal-2", name: "仕事", color: "#3b82f6" },
    { id: "cal-3", name: "個人", color: "#10b981" },
];

// Mock events for demonstration
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

const mockEvents: CalendarEvent[] = [
    {
        id: "evt-1",
        title: "記念日",
        start: new Date(year, month, 5),
        end: new Date(year, month, 5),
        allDay: true,
        color: "#ef4444",
        calendarId: "cal-1",
        calendarName: "恋人",
    },
    {
        id: "evt-2",
        title: "テスト予定",
        start: new Date(year, month, 6),
        end: new Date(year, month, 8),
        allDay: true,
        color: "#10b981",
        calendarId: "cal-3",
        calendarName: "個人",
    },
    {
        id: "evt-3",
        title: "建国記念の日",
        start: new Date(year, month, 11),
        end: new Date(year, month, 11),
        allDay: true,
        color: "#ef4444",
        calendarId: "cal-1",
        calendarName: "恋人",
    },
    {
        id: "evt-4",
        title: "バレンタイン",
        start: new Date(year, month, 14),
        end: new Date(year, month, 14),
        allDay: true,
        color: "#f59e0b",
        calendarId: "cal-1",
        calendarName: "恋人",
    },
    {
        id: "evt-5",
        title: "天皇誕生日",
        start: new Date(year, month, 23),
        end: new Date(year, month, 23),
        allDay: true,
        color: "#ef4444",
        calendarId: "cal-1",
        calendarName: "恋人",
    },
];

let events = [...mockEvents];

export async function getEvents(
    startDate: Date,
    endDate: Date
): Promise<CalendarEvent[]> {
    // Simulate API latency
    await new Promise((r) => setTimeout(r, 100));
    return events.filter((e) => e.start >= startDate && e.start <= endDate);
}

export async function getEventsForMonth(
    year: number,
    month: number
): Promise<CalendarEvent[]> {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return getEvents(start, end);
}

export async function createEvent(
    event: Omit<CalendarEvent, "id">
): Promise<CalendarEvent> {
    await new Promise((r) => setTimeout(r, 200));
    const newEvent: CalendarEvent = {
        ...event,
        id: `evt-${Date.now()}`,
    };
    events.push(newEvent);
    return newEvent;
}

export async function updateEvent(
    updatedEvent: CalendarEvent
): Promise<CalendarEvent> {
    await new Promise((r) => setTimeout(r, 200));
    const index = events.findIndex((e) => e.id === updatedEvent.id);
    if (index !== -1) {
        events[index] = updatedEvent;
    }
    return updatedEvent;
}

export async function getCalendars(): Promise<CalendarInfo[]> {
    await new Promise((r) => setTimeout(r, 50));
    return MOCK_CALENDARS;
}
