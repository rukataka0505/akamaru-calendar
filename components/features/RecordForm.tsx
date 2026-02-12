"use client";

import React, { useState, useRef } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Camera, ImagePlus, X, Upload } from "lucide-react";

interface RecordFormProps {
    selectedDate: Date | null;
    onSave: (record: RecordData) => void;
}

export interface RecordData {
    date: Date;
    comment: string;
    photos: File[];
    album: string;
}

const ALBUMS = [
    { id: "default", name: "すべての写真" },
    { id: "date-photos", name: "デートの記録" },
    { id: "food", name: "ご飯の記録" },
    { id: "travel", name: "旅行" },
];

export default function RecordForm({ selectedDate, onSave }: RecordFormProps) {
    const [comment, setComment] = useState("");
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState("default");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).filter((f) =>
            f.type.startsWith("image/")
        );
        setPhotos((prev) => [...prev, ...newFiles]);

        // Generate previews
        newFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleSave = () => {
        if (!selectedDate) return;
        onSave({
            date: selectedDate,
            comment,
            photos,
            album: selectedAlbum,
        });
        setComment("");
        setPhotos([]);
        setPreviews([]);
        setSelectedAlbum("default");
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Date Display */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Camera size={16} className="text-accent" />
                <span>
                    {selectedDate
                        ? format(selectedDate, "yyyy年M月d日 (E)", { locale: ja })
                        : "日付を選択"}
                    の記録
                </span>
            </div>

            {/* Photo Upload Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative rounded-xl border-2 border-dashed transition-all duration-200
          ${isDragging
                        ? "border-accent bg-accent-light scale-[1.02]"
                        : "border-border bg-muted/30 hover:border-muted-foreground/30"
                    }
          ${photos.length === 0 ? "py-8" : "p-3"}
        `}
            >
                {photos.length === 0 ? (
                    /* Empty State */
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-3 w-full"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                            <ImagePlus size={24} className="text-accent" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-foreground">
                                写真を追加
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                タップして選択 / ドラッグ&ドロップ
                            </p>
                        </div>
                    </button>
                ) : (
                    /* Photo Grid */
                    <div className="grid grid-cols-3 gap-2">
                        {previews.map((preview, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden">
                                <img
                                    src={preview}
                                    alt={`写真 ${idx + 1}`}
                                    className="h-full w-full object-cover"
                                />
                                <button
                                    onClick={() => removePhoto(idx)}
                                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {/* Add More Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-accent hover:bg-accent-light transition-colors"
                        >
                            <ImagePlus size={20} className="text-muted-foreground" />
                        </button>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />
            </div>

            {/* Album Selection */}
            <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                    アルバムに追加
                </span>
                <div className="flex flex-wrap gap-2">
                    {ALBUMS.map((album) => (
                        <button
                            key={album.id}
                            onClick={() => setSelectedAlbum(album.id)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedAlbum === album.id
                                    ? "bg-accent text-white shadow-sm"
                                    : "bg-muted text-muted-foreground hover:bg-border"
                                }`}
                        >
                            {album.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-1">
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="この日のひとこと..."
                    rows={2}
                    className="w-full resize-none rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                />
            </div>

            {/* Save Record Button */}
            <button
                onClick={handleSave}
                disabled={photos.length === 0}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${photos.length > 0
                        ? "bg-accent text-white active:bg-accent/80 shadow-sm"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
            >
                <Upload size={16} />
                記録を保存（Google Drive）
            </button>
        </div>
    );
}
