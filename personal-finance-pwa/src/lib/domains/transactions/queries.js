import Dexie, { liveQuery } from "dexie";
import { db } from "$lib/db";
import { writable } from "svelte/store";
import { BATCH_SIZE } from "$lib/constants/constants";
import { getActiveCategories, mapTransactionsWithCategories } from "../categories";


export function useLazyTransactions() {
    const { subscribe, set, update } = writable({
        transactions: [],
        loading: false,
        lastCursor: null,
        hasMore: true,
    });

    let catPromise = getActiveCategories();

    async function loadMore() {
        let currentState;

        update(s => {
            if (s.loading || !s.hasMore) return s;
            currentState = s;
            return {...s, loading: true};
        });

        if (!currentState) return;

        const categories = await catPromise;

        const lowerBound = [0, Dexie.minKey, Dexie.minKey]

        const upperBound = currentState.lastCursor 
            ? [0, currentState.lastCursor.date, currentState.lastCursor.uuid]
            : [0, Dexie.maxKey, Dexie.maxKey];

        const nextBatch = await db.transactions
            .where('[deleted+date+uuid]')
            .between(
                lowerBound, upperBound,
                true, false
            )
            .reverse()
            .limit(BATCH_SIZE)
            .toArray();

        const enriched = await mapTransactionsWithCategories(nextBatch, categories);
        console.log(enriched);

        const lastItem = nextBatch.at(-1);

        update(s => ({
            transactions: [...s.transactions, ...enriched],
            loading: false,
            lastCursor: lastItem
                ? { date: lastItem.date, uuid: lastItem.uuid }
                : s.lastCursor,
            hasMore: nextBatch.length === BATCH_SIZE
        }));
    }

    return { subscribe, loadMore }
}

export function getFrequentTransactions(limit=10) {
    return liveQuery(() => 
        db.transactions
            .where('deleted')
            .equals(0)
            .toArray()
            .then(async (transactions) => {
                const frequencyMap = {};
                for (const tx of transactions) {
                    const key = JSON.stringify({
                        transactionType: tx.transactionType,
                        description: tx.description?.trim().toLowerCase(),
                        amount: "", //tx.amount,
                        categoryUuid: tx.categoryUuid
                    });
                    frequencyMap[key] = (frequencyMap[key] || 0) + 1;
                }
                const sortedTransactions = Object.entries(frequencyMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, limit)
                    .map(([key]) => JSON.parse(key));
                
                const categories = await getActiveCategories();

                const enriched = await mapTransactionsWithCategories(sortedTransactions, categories);
                return enriched;
            })
    );
}

export function useRecentTransactions(limit) {
    return liveQuery(async () => {
        const [txns, cats] = await Promise.all([
            db.transactions
                .orderBy('date')
                .reverse()
                .filter(tx => tx.deleted === 0)
                .limit(limit)
                .toArray(),
            getActiveCategories()
        ]);

        const enriched = await mapTransactionsWithCategories(txns, cats);
        return enriched;
    });
}

export function useTransactions() {
    return liveQuery(async () => {
        const [txns, cats] = await Promise.all([
            db.transactions
                .orderBy('date')
                .reverse()
                .filter(tx => tx.deleted === 0)
                .toArray(),
            getActiveCategories()
        ]);

        const enriched = await mapTransactionsWithCategories(txns, cats);
        return enriched;
    });
}

export function getTransactionsByCategory(categoryUuid, start, end) {
    return liveQuery(() => {
        let txs = db.transactions
            .filter(tx => tx.deleted === 0)
            .filter(tx => tx.categoryUuid === categoryUuid);
        
        if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            
            txs = txs.and(tx => {
                const date = new Date(tx.date);
                return date >= startDate && date <= endDate;
            });
        }

        return txs.toArray()
    });
}
