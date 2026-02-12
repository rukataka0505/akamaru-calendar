import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, MoreHorizontal, Save } from "lucide-react";
import { MemoItem } from "@/lib/types";
import { updateMemo } from "@/lib/notebookService";

interface NotebookDetailProps {
    memo: MemoItem;
    onBack: () => void;
    onUpdate: (updatedMemo: MemoItem) => void;
}

export default function NotebookDetail({ memo, onBack, onUpdate }: NotebookDetailProps) {
    const [title, setTitle] = useState(memo.title);
    const [content, setContent] = useState(memo.content);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Auto-save logic can be added here, but for now we'll use manual or blur save
    // Let's implement auto-save debounce later if needed.

    const handleSave = async () => {
        setIsSaving(true);
        const updated: MemoItem = {
            ...memo,
            title,
            content,
            updatedAt: new Date(),
        };
        try {
            await updateMemo(updated);
            onUpdate(updated);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Save on unmount or back?
    useEffect(() => {
        return () => {
            // Cleanup
        };
    }, []);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        setHasUnsavedChanges(true);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setHasUnsavedChanges(true);
    };

    return (
        <div className="flex flex-col h-full bg-[#FDFBF7] animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#FDFBF7]/90 backdrop-blur-sm sticky top-0 z-10">
                <button
                    onClick={() => {
                        if (hasUnsavedChanges) handleSave(); // Simple save on back
                        onBack();
                    }}
                    className="p-2 -ml-2 text-[#8D7B68] rounded-full hover:bg-black/5 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="flex-1 mx-2 flex justify-center">
                    <span className="text-xs text-[#8D7B68]/60 font-medium">
                        {isSaving ? "保存中..." : hasUnsavedChanges ? "未保存" : "保存済み"}
                    </span>
                </div>

                <button
                    onClick={handleSave}
                    className={`p-2 -mr-2 text-[#8D7B68] rounded-full hover:bg-black/5 transition-colors ${hasUnsavedChanges ? "text-accent" : ""}`}
                >
                    {hasUnsavedChanges ? <Save size={20} /> : <MoreHorizontal size={24} />}
                </button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="タイトル"
                    className="w-full bg-transparent text-2xl font-bold text-[#5C5C5C] placeholder:text-[#5C5C5C]/30 outline-none mb-4"
                />

                <textarea
                    value={content}
                    onChange={handleContentChange}
                    placeholder="タップして入力..."
                    className="w-full h-[calc(100%-4rem)] bg-transparent text-base text-[#5C5C5C] placeholder:text-[#5C5C5C]/30 outline-none resize-none leading-relaxed"
                />
            </div>
        </div>
    );
}
