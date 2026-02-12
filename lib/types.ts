export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color: string;
  calendarId: string;
  calendarName: string;
  memo?: string;
  location?: string;
  url?: string;
}

export interface CalendarInfo {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}

export type EventColor =
  | "emerald"
  | "rose"
  | "sky"
  | "amber"
  | "violet"
  | "orange"
  | "slate";

export const EVENT_COLORS: Record<EventColor, string> = {
  emerald: "#10b981",
  rose: "#f43f5e",
  sky: "#0ea5e9",
  amber: "#f59e0b",
  violet: "#8b5cf6",
  orange: "#f97316",
  slate: "#64748b",
};

export const EVENT_COLOR_LABELS: Record<EventColor, string> = {
  emerald: "エメラルド・グリーン",
  rose: "ローズ",
  sky: "スカイブルー",
  amber: "アンバー",
  violet: "バイオレット",
  orange: "オレンジ",
  slate: "スレート",
};

// ===== Album Types =====

export interface DriveMedia {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink: string;
  webContentLink: string;
  webViewLink: string;
  createdTime: string; // ISO 8601
  modifiedTime: string;
  size?: string;
  imageMediaMetadata?: {
    width: number;
    height: number;
  };
}

export interface MediaComment {
  id: string;
  mediaId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface MediaReaction {
  mediaId: string;
  isFavorite: boolean;
}

export interface AlbumGroup {
  date: string; // "yyyy-MM-dd"
  displayDate: string; // "2026年2月12日"
  media: DriveMedia[];
  coverImage: DriveMedia;
}
