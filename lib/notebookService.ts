"use server";

import { createAdminClient } from "./supabase";
import { MemoItem, UploadedBy } from "./types";
import { revalidatePath } from "next/cache";

// Type needed for Supabase return type casting if strictly needed,
// but for now we will map manually.

function mapMemo(row: any): MemoItem {
    return {
        id: row.id,
        title: row.title,
        content: row.content || "",
        color: row.color,
        lastEditedBy: row.last_edited_by as UploadedBy,
        updatedAt: new Date(row.updated_at),
        createdAt: new Date(row.created_at),
    };
}

export async function getMemos(): Promise<MemoItem[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("memos")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Error fetching memos:", error);
        return [];
    }

    return data.map(mapMemo);
}

export async function createMemo(title: string, color: string, userId: UploadedBy): Promise<MemoItem> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("memos")
        .insert({
            title: title || "新しいノート",
            content: "",
            color: color,
            last_edited_by: userId,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create memo: ${error.message}`);
    }

    revalidatePath("/"); // Revalidate the page to show new memo
    return mapMemo(data);
}

export async function updateMemo(memo: MemoItem): Promise<MemoItem> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("memos")
        .update({
            title: memo.title,
            content: memo.content,
            color: memo.color,
            last_edited_by: memo.lastEditedBy,
            updated_at: new Date().toISOString(),
        })
        .eq("id", memo.id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update memo: ${error.message}`);
    }

    revalidatePath("/");
    return mapMemo(data);
}

export async function deleteMemo(id: string): Promise<void> {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from("memos")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Failed to delete memo:", error);
        throw new Error(`Failed to delete memo: ${error.message}`);
    }

    revalidatePath("/");
}
