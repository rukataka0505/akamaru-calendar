"use client";

import React, { useState, useEffect } from "react";
import { verifyPin, isAuthenticated } from "@/lib/auth/pin";

export default function PinProtection({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    // 初回ロード時に認証状態をチェック (Server Action経由)
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const auth = await isAuthenticated(); // Server Action that checks cookie
            setIsAuthorized(auth);
        } catch (e) {
            console.error("Auth check failed", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);

        // Server Action to verify PIN and set cookie
        const valid = await verifyPin(pin);

        if (valid) {
            setIsAuthorized(true);
        } else {
            setError(true);
            setPin("");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">PIN認証</h2>
                        <p className="text-gray-500 text-sm">アクセスするにはPINを入力してください</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="tel"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full text-center text-4xl tracking-widest font-bold py-4 border-b-2 border-gray-200 focus:border-rose-500 outline-none transition-colors placeholder-gray-200"
                                placeholder="••••"
                                maxLength={4}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p className="text-rose-500 text-sm text-center animate-shake">
                                PINが間違っています
                            </p>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-rose-500/30"
                        >
                            解除
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
