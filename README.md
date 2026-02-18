# Couple's Digital Home PWA (Akaruka Calendar)

## 概要
Google Drive 2TBをフル活用した「思い出が消えないデジタルな家」。TimeTreeのようなカレンダーUIをベースに、写真共有（Google Drive）と予定共有（Google Calendar）を一元管理するPWA。

## コンセプト
- **Dense & Clean**: 密度が高く、かつ整理されたUI（TimeTreeライク）
- **Native Feel**: アプリのような操作感（スワイプ、タップ、振動）
- **Memory Home**: 予定だけでなく、その日の「記録」を残す場所

## 技術スタック
- **Frontend**: Next.js (App Router), Tailwind CSS, shadcn/ui (Planned)
- **Backend/DB**: Supabase (Database) + Server Actions (Service Role)
- **Auth**: 簡易PIN認証 + Cookie
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
    - 簡易PIN認証（`APP_PIN` 環境変数）
    - 初回アクセス時にPIN入力 → Cookieにトークン保存（1年間有効）
    - ユーザー識別はUI上のトグルで「あかり/るか」を切り替え（`UserSwitcher`）

5.  **Google Drive 連携**
    - アップロード: Client -> API Route (`/api/drive/upload`) -> Google Drive API
    - 閲覧: Client -> API Route (`/api/drive/file/[id]`) -> Google Drive (Proxy)
    - メタデータ: Supabase `media_metadata` テーブルで管理

## セットアップ手順

### 1. 環境変数 (.env.local)

```env
# PIN Authentication
APP_PIN=0505
NEXT_PUBLIC_DEFAULT_USER=user-1

# App URL (Optional, defaults to http://localhost:3000)
NEXT_PUBLIC_APP_URL=https://akaruka.r-k.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...  # for Server Actions

# Google Drive API
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_DRIVE_FOLDER_ID=...
```

### 2. Supabase テーブル作成

以下のSQLを実行してテーブルを作成してください。

#### `events` (カレンダー)
```sql
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#10b981',
  calendar_id TEXT DEFAULT 'cal-1',
  calendar_name TEXT DEFAULT '恋人',
  memo TEXT,
  location TEXT,
  url TEXT,
  repeat_dates JSONB,
  notifications JSONB,
  recurrence JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `memos` (共有ノート)
```sql
CREATE TABLE memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '新しいノート',
  content TEXT DEFAULT '',
  color TEXT DEFAULT '#FFBCBC',
  last_edited_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `media_metadata` (アルバム)
```sql
CREATE TABLE media_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drive_file_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  created_time TIMESTAMPTZ NOT NULL,
  modified_time TIMESTAMPTZ DEFAULT NOW(),
  size BIGINT,
  width INT,
  height INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 開発ルール
- **意図優先**: コードを書く前に「何のために」を明確にする。
- **UI/UX**: ユーザーの操作感（心地よさ）を最優先。

## アルバム機能 (Phase 2)

### コンポーネント構成
```
components/album/
├── AlbumTimeline.tsx   # 日付ごとのタイムライン一覧
├── DateCard.tsx        # 日付カード（代表写真 + 日付オーバーレイ）
├── MediaFeed.tsx       # フルスクリーン詳細フィード
├── MediaItem.tsx       # 個別メディア表示 + Lazy Load
├── HeartButton.tsx     # お気に入りトグル（ON/OFF）
├── FavoritesView.tsx   # お気に入り一覧表示（グリッド）
└── CommentSection.tsx  # コメント一覧 + 入力
components/ui/
└── BottomNav.tsx       # カレンダー / アルバム タブ切替
```

### アルバムデータフロー

```
[アルバム一覧]
  Client → API Route (/api/drive/list) → Google Drive API
  ※ thumbnailLink でサムネイル取得 → 高速一覧表示

[フルスクリーンフィード]
  Client → API Route (/api/drive/file) → Google Drive API
  ※ webContentLink でオリジナル画像取得

[お気に入り（ハート）]
  Client ←→ Supabase (reactions テーブル)
  ※ トグル式（ON/OFF、1ユーザー1メディアにつき1回）
  ※ お気に入り一覧画面でフィルタリング表示

[コメント]
  Client ←→ Supabase Realtime (comments テーブル)
  ※ リアルタイム更新

[オリジナルダウンロード]
  Client → Google Drive webContentLink へ直接リダイレクト
```
