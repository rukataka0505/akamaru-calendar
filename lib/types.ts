export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;          // 繰り返し間隔（例: 2なら「2週間ごと」）
  endDate?: Date;            // 繰り返し期限
  weekdays?: Weekday[];      // 週の繰り返し条件（毎週の場合）
}

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
  repeatDates?: Date[]; // 複数日予定の日付リスト
  notifications?: string[]; // 通知設定（例: ["10分前", "1日前"]）
  recurrence?: RecurrenceRule; // 繰り返しルール
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

export type UploadedBy = "user-1" | "user-2";

export const USER_PROFILES: Record<UploadedBy, { name: string; color: string }> = {
  "user-1": { name: "あかり", color: "#f43f5e" },
  "user-2": { name: "るか", color: "#0ea5e9" },
};

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
  uploadedBy: UploadedBy;
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

export interface MemoItem {
  id: string;
  title: string;
  content: string; // Markdown or text
  color: string; // Theme color (hex)
  updatedAt: Date;
  createdAt: Date;
  lastEditedBy: UploadedBy;
}
