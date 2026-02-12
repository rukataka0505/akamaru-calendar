"use client";

import React, { useState, useEffect } from "react";
import { Send, ChevronDown, ChevronUp } from "lucide-react";
import { MediaComment } from "@/lib/types";
import { getCommentsForMedia, addComment } from "@/lib/mockDriveService";

interface CommentSectionProps {
    mediaId: string;
}

export default function CommentSection({ mediaId }: CommentSectionProps) {
    const [comments, setComments] = useState<MediaComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
        const comment = await addComment(mediaId, newComment.trim());
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
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white/80 transition-colors py-1"
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
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center text-[0.6rem] font-bold text-white">
                                        {comment.userName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-white/80">
                                            {comment.userName}
                                        </span>
                                        <p className="text-xs text-white/60 mt-0.5 break-words">
                                            {comment.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-white/40 py-2">
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
                            className="flex-1 bg-white/10 rounded-full px-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:bg-white/15 transition-colors"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!newComment.trim()}
                            className={`flex items-center justify-center w-7 h-7 rounded-full transition-all ${newComment.trim()
                                    ? "bg-accent text-white active:scale-90"
                                    : "bg-white/10 text-white/30"
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
