import { db } from "$lib/db";
import { liveQuery } from "dexie";
import { getActiveCategories } from "../categories";
import { readable } from "svelte/store";

export async function getActiveBudgets() {
    const [budgets, categories] = await Promise.all([
        db.budgets.where('deleted').equals(0).toArray(),
        getActiveCategories()
    ]);
    
    const categoryMap = Object.fromEntries(categories.map(c => [c.uuid, c]));

    return budgets.map(b => ({
        ...b,
        category: categoryMap[b.categoryUuid]?.name,
        categoryTransactionType: categoryMap[b.categoryUuid]?.transactionType
    }));
}

export function useBudgets() {
    return readable([], (set) => {
        const subscription = liveQuery(() => getActiveBudgets())
            .subscribe({
                next: set,
                error: console.error
            });
        return () => subscription.unsubscribe();
    })
}