import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock } from "lucide-react";
import { MemoItem, UploadedBy } from "@/lib/types";
import { getMemos, createMemo } from "@/lib/notebookService";
import NotebookDetail from "./NotebookDetail";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface NotebookDashboardProps {
    currentUserId: UploadedBy;
}

export default function NotebookDashboard({ currentUserId }: NotebookDashboardProps) {
    const [memos, setMemos] = useState<MemoItem[]>([]);
    const [selectedMemo, setSelectedMemo] = useState<MemoItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load memos
    const loadMemos = async () => {
        setIsLoading(true);
        try {
            const data = await getMemos();
            setMemos(data);
        } catch (error) {
            console.error("Failed to load memos", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMemos();
    }, []);

    const handleCreateMemo = async () => {
        // Pick a random pastel color or default
        const colors = ["#FFBCBC", "#B4E4FF", "#C1FFD7", "#F3FFE3", "#E6D5B8"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        try {
            const newMemo = await createMemo("", randomColor, currentUserId);
            setMemos([newMemo, ...memos]);
            setSelectedMemo(newMemo);
        } catch (error) {
            console.error("Failed to create memo", error);
        }
    };

    const handleUpdateMemoList = (updatedMemo: MemoItem) => {
        setMemos(prev => prev.map(m => m.id === updatedMemo.id ? updatedMemo : m));
        setSelectedMemo(updatedMemo); // Update the selected one too for immediate reflection
    };

    // If a memo is selected, show detail view
    if (selectedMemo) {
        return (
            <NotebookDetail
                memo={selectedMemo}
                onBack={() => {
                    setSelectedMemo(null);
                    loadMemos(); // Refresh list order on back
                }}
                onUpdate={handleUpdateMemoList}
            />
        );
    }

    return (
        <div className="flex flex-col w-full h-full bg-[#FDFBF7] animate-fadeIn">
            <div className="safe-top w-full bg-[#FDFBF7] z-10 sticky top-0">
                <div className="px-5 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-[#5C5C5C] flex items-center gap-2">
                        <BookOpen size={20} className="text-[#8D7B68]" />
                        共有ノート
                    </h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-20">
                <div className="grid grid-cols-2 gap-4">
                    {/* New Notebook Button */}
                    <button
                        onClick={handleCreateMemo}
                        className="aspect-[3/4] rounded-xl border-2 border-dashed border-[#E6D5B8] flex flex-col items-center justify-center gap-2 text-[#8D7B68] hover:bg-[#F8F4EB] transition-colors active:scale-95"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#E6D5B8]/20 flex items-center justify-center text-[#8D7B68]">
                            <Plus size={24} />
                        </div>
                        <span className="font-medium text-sm">ノートを作成</span>
                    </button>

                    {/* Memo Cards */}
                    {memos.map((memo) => (
                        <div
                            key={memo.id}
                            onClick={() => setSelectedMemo(memo)}
                            className="aspect-[3/4] bg-white rounded-xl shadow-sm border border-[#E6D5B8]/30 overflow-hidden flex flex-col relative group active:scale-95 transition-transform cursor-pointer"
                        >
                            {/* Color TAG */}
                            <div className="h-3 w-full" style={{ backgroundColor: memo.color }} />

                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className={`font-bold text-[#5C5C5C] text-lg leading-tight mb-2 ${!memo.title ? "text-gray-300 italic" : ""}`}>
                                    {memo.title || "無題"}
                                </h3>
                                <div className="text-xs text-[#8D7B68] line-clamp-4 whitespace-pre-wrap leading-relaxed opacity-80">
                                    {memo.content || "(本文なし)"}
                                </div>

                                <div className="mt-auto pt-3 flex items-center justify-end text-[10px] text-[#A0A0A0]">
                                    <Clock size={10} className="mr-1" />
                                    {format(new Date(memo.updatedAt), "M/d HH:mm", { locale: ja })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {memos.length === 0 && !isLoading && (
                    <div className="w-full text-center py-10 text-[#8D7B68]/50 text-sm">
                        まだノートがありません。<br />左上のボタンから作成してみましょう。
                    </div>
                )}
            </div>
        </div>
    );
}
