import { db } from "$lib/db";
import { liveQuery } from "dexie";
import { readable } from "svelte/store";

export async function getActiveCategories() {
    const cats = await db.categories.where("deleted").equals(0).toArray();
    return cats
        .map(c => ({ ...c, transactionType: c.transactionType.toLowerCase() }))
        .sort((a, b) => {
            if (a.transactionType !== b.transactionType) {
                return a.transactionType === "income" ? -1 : 1;
            }
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        });
}

export function useCategories() {
    return readable([], (set) => {
        const sub = liveQuery(() => getActiveCategories())
            .subscribe({
                next: set,
                error: console.error
            });
        return () => sub.unsubscribe();
    })
}