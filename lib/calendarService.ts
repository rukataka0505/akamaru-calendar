"use server";

import { createAdminClient } from "./supabase";
import { CalendarEvent, CalendarInfo } from "./types";
import { revalidatePath } from "next/cache";

import { MOCK_CALENDARS } from "./constants";

function mapEvent(row: any): CalendarEvent {
    return {
        id: row.id,
        title: row.title,
        start: new Date(row.start_time),
        end: new Date(row.end_time),
        allDay: row.all_day,
        color: row.color,
        calendarId: row.calendar_id || "cal-1", // Fallback if column missing
        calendarName: row.calendar_name || "カレンダー", // Fallback if column missing
        memo: row.memo,
        location: row.location,
        url: row.url,
        repeatDates: row.repeat_dates ? row.repeat_dates.map((d: string) => new Date(d)) : undefined,
        notifications: row.notifications,
        recurrence: row.recurrence,
    };
}

export async function getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
        const supabase = createAdminClient();

        // In UTC for query
        const startIso = startDate.toISOString();
        const endIso = endDate.toISOString();

        // Query events that overlap with the range [startDate, endDate]
        // event_start <= query_end AND event_end >= query_start
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .lte("start_time", endIso)
            .gte("end_time", startIso);

        if (error) {
            console.error("Failed to fetch events:", error);
            // Log full error details
            console.error("Error details:", JSON.stringify(error, null, 2));
            return [];
        }

        return data.map(mapEvent);
    } catch (error) {
        console.error("Unexpected error in getEvents:", error);
        return [];
    }
}

export async function getEventsForMonth(year: number, month: number): Promise<CalendarEvent[]> {
    // month is 0-indexed
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return getEvents(startDate, endDate);
}

export async function createEvent(event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("events")
        .insert({
            title: event.title,
            start_time: event.start.toISOString(),
            end_time: event.end.toISOString(),
            all_day: event.allDay,
            color: event.color,
            // calendar_id and calendar_name columns are missing in DB, so we omit them
            // calendar_id: event.calendarId,
            // calendar_name: event.calendarName,
            memo: event.memo,
            location: event.location,
            url: event.url,
            repeat_dates: event.repeatDates ? event.repeatDates.map(d => d.toISOString()) : null,
            notifications: event.notifications,
            recurrence: event.recurrence,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create event: ${error.message}`);
    }

    revalidatePath("/");
    return mapEvent(data);
}

export async function updateEvent(updatedEvent: CalendarEvent): Promise<CalendarEvent> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("events")
        .update({
            title: updatedEvent.title,
            start_time: updatedEvent.start.toISOString(),
            end_time: updatedEvent.end.toISOString(),
            all_day: updatedEvent.allDay,
            color: updatedEvent.color,
            // calendar_id and calendar_name columns are missing in DB, so we omit them
            // calendar_id: updatedEvent.calendarId,
            // calendar_name: updatedEvent.calendarName,
            memo: updatedEvent.memo,
            location: updatedEvent.location,
            url: updatedEvent.url,
            repeat_dates: updatedEvent.repeatDates ? updatedEvent.repeatDates.map(d => d.toISOString()) : null,
            notifications: updatedEvent.notifications,
            recurrence: updatedEvent.recurrence,
            updated_at: new Date().toISOString(),
        })
        .eq("id", updatedEvent.id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update event: ${error.message}`);
    }

    revalidatePath("/");
    return mapEvent(data);
}

export async function getCalendars(): Promise<CalendarInfo[]> {
    // Still mock for now as we don't have a calendars table yet
    return MOCK_CALENDARS;
}
