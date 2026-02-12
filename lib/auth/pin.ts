"use server";

import { cookies } from "next/headers";

const PIN_COOKIE_NAME = "app-pin-token";
const APP_PIN = process.env.APP_PIN;
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function verifyPin(pin: string): Promise<boolean> {
    const correctPin = APP_PIN;

    // If no PIN is set in env, allow access (dev mode or unconfigured)
    if (!correctPin) return true;

    if (pin === correctPin) {
        const cookieStore = await cookies();
        cookieStore.set(PIN_COOKIE_NAME, "valid", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: MAX_AGE,
            path: "/",
        });
        return true;
    }
    return false;
}

export async function isAuthenticated(): Promise<boolean> {
    const correctPin = APP_PIN;
    if (!correctPin) return true;

    const cookieStore = await cookies();
    const token = cookieStore.get(PIN_COOKIE_NAME);
    return token?.value === "valid";
}

export async function logout(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(PIN_COOKIE_NAME);
}
