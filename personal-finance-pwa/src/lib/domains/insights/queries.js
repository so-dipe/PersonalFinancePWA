import { db } from "$lib/db";
import { liveQuery } from "dexie";
import { getActiveCategories } from "../categories";
import { getAllDays, groupTransactionsByDay, indexByUuid, summariseByCategory } from "./agg/helpers";

export function liveTransactionsBetween(start, end) {
    return liveQuery(() =>
        db.transactions
            .where("date")
            .between(start, end, true, true)
            .filter(tx => tx.deleted === 0)
            .toArray()
    );
}

export function summariseTransactionsByCategories(start, end) {
    return liveQuery(async () => {
        const [transactions, categories] = await Promise.all([
            db.transactions
                .where("date")
                .between(start, end, true, true)
                .filter(tx => tx.deleted === 0)
                .toArray(),
            getActiveCategories()
        ])

        const categoryMap = indexByUuid(categories);
        const summary = summariseByCategory(transactions);

        return Object.entries(summary).map(([categoryUuid, total]) => ({
            categoryUuid: categoryUuid,
            category: categoryMap[categoryUuid] ?? null,
            total
        }));
    })
}

export function dailyCategoryContribution(start, end) {
    return liveQuery(async () => {
        const [transactions, categories] = await Promise.all([
            db.transactions
                .where("date")
                .between(start, end, true, true)
                .filter(tx => tx.deleted === 0)
                .toArray(),
            getActiveCategories()
        ]);

        const categoryMap = indexByUuid(categories);
        const categoryUuids = categories.map(c => c.uuid);

        const days = getAllDays(start, end).map(d => d.toISOString().slice(0, 10));

        const summaryMap = {};

        for (const day of days) {
            summaryMap[day] = {};
            for (const uuid of categoryUuids) {
                summaryMap[day][uuid] = 0;
            }
        }

        for (const tx of transactions) {
            const day = new Date(tx.date).toISOString().slice(0, 10);
            summaryMap[day][tx.categoryUuid] += tx.amount;
        }

        return days.map(day => ({
            date: day,
            categories: categoryUuids.map(uuid => ({
                categoryUuid: uuid,
                category: categoryMap[uuid],
                total: summaryMap[day][uuid]
            }))
        }));
    });
}