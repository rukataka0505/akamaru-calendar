# Couple's Digital Home PWA (Akaruka Calendar)

## 概要
Google Drive 2TBをフル活用した「思い出が消えないデジタルな家」。TimeTreeのようなカレンダーUIをベースに、写真共有（Google Drive）と予定共有（Google Calendar）を一元管理するPWA。

## コンセプト
- **Dense & Clean**: 密度が高く、かつ整理されたUI（TimeTreeライク）
- **Native Feel**: アプリのような操作感（スワイプ、タップ、振動）
- **Memory Home**: 予定だけでなく、その日の「記録（写真・日記）」を残す場所

## 技術スタック
- **Frontend**: Next.js (App Router), Tailwind CSS, shadcn/ui (Planned)
- **Backend/DB**: Supabase (Auth, Database, Realtime)
- **Storage**: Google Drive API (Photos/Videos)
- **Calendar**: Google Calendar API (Events)

## ディレクトリ構造 (Proposed)

```
app/
├── app/
│   ├── api/                 # Next.js API Routes (Google Proxy)
│   ├── (auth)/              # Login/Signup pages
│   ├── (main)/              # Main App Layout
│   │   └── page.tsx         # Calendar View
│   └── layout.tsx           # PWA Root Layout
├── components/
│   ├── calendar/            # Calendar specific components
│   │   ├── MonthView.tsx
│   │   └── DayDetail.tsx
│   ├── features/            # Feature specific components
│   │   ├── EventForm.tsx    # Google Calendar Input
│   │   ├── RecordForm.tsx   # Google Drive Photo Upload
│   │   └── BottomSheet.tsx  # Vaul wrapper
│   └── ui/                  # Shared UI components (Button, Input, etc.)
├── lib/
│   ├── google/              # Google API Clients
│   │   ├── drive.ts
│   │   └── calendar.ts
│   ├── supabase/            # Supabase Client
│   │   └── client.ts
│   └── utils.ts             # Helpers
└── types/                   # Type Definitions
```

## データフロー

1.  **予定 (Events)**
    - Client -> API Route (`/api/calendar`) -> Google Calendar API
    - *理由*: Google APIの認証（Server-side）を隠蔽するため。

2.  **記録 (Records/Photos)**
    - Client -> API Route (`/api/drive/upload`) -> Google Drive API
    - *理由*: 大容量ファイルのアップロードフロー制御と、Driveのフォルダ管理（`Akaruka/2026/02` など）をサーバー側で行うため。

3.  **リアルタイム (Hearts)**
    - Client <-> Supabase Realtime
    - *理由*: 低遅延での双方向通信（「今見てるよ」機能など）。

4.  **認証 (Auth)**
    - Supabase Auth (Google Login)
    - *連携*: SupabaseのユーザーIDとGoogleのアクセストークンを紐付ける。

## 開発ルール
- **意図優先**: コードを書く前に「何のために」を明確にする。
- **UI/UX**: ユーザーの操作感（心地よさ）を最優先。
