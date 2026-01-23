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

export function getNextEndDate(start, periodUnit, periodCount) {
    const end = new Date(start.getTime());

    switch (periodUnit) {
        case 'day':
            end.setDate(start.getDate() + periodCount);
            break;
        case 'week':
            end.setDate(start.getDate() + periodCount * 7);
            break;
        case 'month':
            {
                const targetMonth = end.getMonth() + periodCount;
                const originalDay = end.getDate();
                end.setMonth(targetMonth);
                if (end.getDate() < originalDay) {
                    end.setDate(0);
                }
            }
            break;
        case 'quarter':
            {
                const targetMonth = end.getMonth() + periodCount * 3;
                const originalDay = end.getDate();
                end.setMonth(targetMonth);
                if (end.getDate() < originalDay) {
                    end.setDate(0);
                }
            }
        case 'year':
            end.setFullYear(start.getFullYear() + periodCount);
            break;
        default:
            throw new Error(`Invalid period unit: ${periodCount}`);
    }
    return end;
}

export function getCurrentBudgetWindow(startDate, periodUnit, periodCount) {
    let start = new Date(startDate);
    let end = getNextEndDate(start, periodUnit, periodCount);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (end < today) {
        start = new Date(end);
        end = getNextEndDate(start, periodUnit, periodCount);
    }
    return {
        start: new Date(start).toISOString().slice(0, 10),
        end: new Date(end).toISOString().slice(0, 10)
    };
}