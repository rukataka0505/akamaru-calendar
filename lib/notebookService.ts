
import { MemoItem, UploadedBy } from "./types";
import { v4 as uuidv4 } from "uuid";

// Mock Data
let MOCK_MEMOS: MemoItem[] = [
    {
        id: "memo-1",
        title: "行きたい場所リスト",
        content: "- 京都のカフェ\n- ディズニーランド\n- 温泉旅行",
        color: "#FFBCBC",
        updatedAt: new Date(),
        createdAt: new Date(),
        lastEditedBy: "user-1",
    },
    {
        id: "memo-2",
        title: "買い物リスト",
        content: "- 洗剤\n- 牛乳\n- 卵",
        color: "#B4E4FF",
        updatedAt: new Date(Date.now() - 86400000), // 1 day ago
        createdAt: new Date(Date.now() - 86400000),
        lastEditedBy: "user-2",
    }
];

export async function getMemos(): Promise<MemoItem[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...MOCK_MEMOS].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function createMemo(title: string, color: string, userId: UploadedBy): Promise<MemoItem> {
    const newMemo: MemoItem = {
        id: uuidv4(),
        title: title || "新しいノート",
        content: "",
        color: color,
        updatedAt: new Date(),
        createdAt: new Date(),
        lastEditedBy: userId,
    };
    MOCK_MEMOS = [newMemo, ...MOCK_MEMOS];
    return newMemo;
}

export async function updateMemo(memo: MemoItem): Promise<MemoItem> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = MOCK_MEMOS.findIndex((m) => m.id === memo.id);
    if (index !== -1) {
        MOCK_MEMOS[index] = { ...memo, updatedAt: new Date() };
        return MOCK_MEMOS[index];
    }
    throw new Error("Memo not found");
}

export async function deleteMemo(id: string): Promise<void> {
    MOCK_MEMOS = MOCK_MEMOS.filter(m => m.id !== id);
}
