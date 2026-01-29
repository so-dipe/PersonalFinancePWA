import { db } from "$lib/db";
import { liveQuery } from "dexie";
import { readable } from "svelte/store";

export const categories = liveQuery(async () => {
    const cats = await db.categories.where("deleted").equals(0).toArray();
    return cats.map(c => ({ ...c, transactionType: c.transactionType.toLowerCase() }));
})

export async function getActiveCategories() {
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