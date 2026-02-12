"use client";

import React, { useState, useEffect } from "react";
import { Send, ChevronDown, ChevronUp } from "lucide-react";
import { MediaComment } from "@/lib/types";
import { getCommentsForMedia, addComment } from "@/lib/driveService";
import { useUser } from "@/components/ui/UserSwitcher";

interface CommentSectionProps {
    mediaId: string;
}

export default function CommentSection({ mediaId }: CommentSectionProps) {
    const [comments, setComments] = useState<MediaComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { currentUserId } = useUser();

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const data = await getCommentsForMedia(mediaId);
            setComments(data);
            setIsLoading(false);
        };
        load();
    }, [mediaId]);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        const comment = await addComment(mediaId, newComment.trim(), currentUserId);
        setComments((prev) => [...prev, comment]);
        setNewComment("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-full">
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors py-1"
            >
                <span>
                    コメント {!isLoading && comments.length > 0 && `(${comments.length})`}
                </span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isExpanded && (
                <div className="mt-2 space-y-2 animate-fadeIn">
                    {/* Comments List */}
                    {comments.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-2">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[0.6rem] font-bold text-orange-600">
                                        {comment.userName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-stone-700">
                                            {comment.userName}
                                        </span>
                                        <p className="text-xs text-stone-600 mt-0.5 break-words">
                                            {comment.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-stone-400 py-2">
                            まだコメントはありません
                        </p>
                    )}

                    {/* Input */}
                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="コメントを入力..."
                            className="flex-1 bg-stone-100 rounded-full px-3 py-1.5 text-xs text-stone-800 placeholder:text-stone-400 outline-none focus:bg-stone-200 transition-colors"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!newComment.trim()}
                            className={`flex items-center justify-center w-7 h-7 rounded-full transition-all ${newComment.trim()
                                ? "bg-orange-500 text-white active:scale-90"
                                : "bg-stone-200 text-stone-400"
                                }`}
                        >
                            <Send size={13} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
