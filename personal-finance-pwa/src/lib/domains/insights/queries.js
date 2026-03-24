import { db } from "$lib/db";
import Dexie, { liveQuery } from "dexie";
import { getActiveCategories, mapTransactionsWithCategories } from "../categories";
import { getAllDays, groupTransactionsByDay, indexByUuid, summariseByCategory } from "./agg/helpers";
import { getTransactionsBetweenDates } from "../transactions";

export function dailyCategoryContribution(start, end) {
    return liveQuery(async () => {
        const [transactions, categories] = await Promise.all([
            getTransactionsBetweenDates(start, end),
            getActiveCategories()
        ]);

        const categoryMap = indexByUuid(categories);
        const categoryUuids = categories.map(c => c.uuid);

        const days = getAllDays(start, end).map(d => d.toISOString().slice(0, 10));

        const summaryMap = {};

        for (const tx of transactions) {
            const day = new Date(tx.date).toISOString().slice(0, 10);

            if (!summaryMap[day]) summaryMap[day] = {};
            if (!summaryMap[day][tx.categoryUuid]) {
                summaryMap[day][tx.categoryUuid] = 0;
            }
            summaryMap[day][tx.categoryUuid] += tx.transactionType === 'income'
                ? tx.amount
                : -tx.amount;
        }

        return days.map(day => ({
            date: day,
            categories: categoryUuids.map(uuid => ({
                categoryUuid: uuid,
                category: categoryMap[uuid],
                total: summaryMap[day]?.[uuid] ?? 0
            }))
        }));
    });
}

export function getAllYears() {
    return liveQuery(async () => {
        const years = await db.transactions
            .orderBy('date')
            .keys()

        return [
            ...new Set(years.map(d => new Date(d).getFullYear()))
        ];
    });
}

export function liveInsights(start, end, selectedCategoryUuids = []) {
    const categorySet = selectedCategoryUuids.length
            ? new Set(selectedCategoryUuids)
            : null;

    return liveQuery(async () => {
        const lowerBound = [0, start, Dexie.minKey]
        const upperBound = [0, end, Dexie.maxKey]

        const [transactions, categories] = await Promise.all([
            getTransactionsBetweenDates(start, end),
            getActiveCategories()
        ]);

        const categoryMap = indexByUuid(categories);

        let totalIncome = 0;
        let totalExpense = 0;
        const byCategory = {};

        for (const tx of transactions) {
            if (categorySet && !categorySet.has(tx.categoryUuid)) continue;

            const category = categoryMap[tx.categoryUuid];

            if (category?.transactionType === "income") {
                totalIncome += tx.amount;
            } else {
                totalExpense += tx.amount;
            }

            byCategory[tx.categoryUuid] = (byCategory[tx.categoryUuid] || 0) + tx.amount;
        }

        const categorySummary = Object.entries(byCategory).map(
            ([uuid, total]) => ({
                categoryUuid: uuid,
                category: categoryMap[uuid],
                total
            })
        );

        return {
            totalIncome,
            totalExpense,
            categorySummary
        };
    });
}