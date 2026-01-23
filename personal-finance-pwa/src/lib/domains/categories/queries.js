import { db } from "$lib/db";
import { liveQuery } from "dexie";
import { readable } from "svelte/store";
import { loadDefaultCategories } from "./repository";

export async function getActiveCategories() {
    const count = await db.categories.where("deleted").equals(0).count();
    if (count === 0) {
        await loadDefaultCategories();
    }
    const cats = await db.categories.where("deleted").equals(0).toArray();
    return cats.map(c => ({ ...c, transactionType: c.transactionType.toLowerCase() }));
}

export function useCategories() {
    return readable([], (set) => {
        const subscription = liveQuery(() => getActiveCategories())
            .subscribe({
                next: set,
                error: console.error
            });
        return () => subscription.unsubscribe();
    })
}