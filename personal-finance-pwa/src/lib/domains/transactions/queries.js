import Dexie, { liveQuery } from "dexie";
import { db } from "$lib/db";
import { writable } from "svelte/store";
import { BATCH_SIZE } from "$lib/constants/constants";
import { getActiveCategories, mapTransactionsWithCategories } from "../categories";


export function useLazyTransactions() {
    let currentLimit = BATCH_SIZE;

    const { subscribe, update } = writable({
        transactions: [],
        loading: false,
        hasMore: true,
        limit: BATCH_SIZE
    });

    let unsubscribeLive;

    function startLiveQuery(limit) {
        if (unsubscribeLive) unsubscribeLive.unsubscribe();

        unsubscribeLive = liveQuery(async () => {
            const categories = await getActiveCategories();
            const transactions = await db.transactions
                .where('[deleted+date+modifiedAt+uuid]')
                .between(
                    [0, Dexie.minKey, Dexie.minKey, Dexie.minKey],
                    [0, Dexie.maxKey, Dexie.minKey, Dexie.maxKey]
                )
                .reverse()
                .limit(limit + 1)
                .toArray();
            
            const visible = transactions.slice(0, limit)
            const enrichedTxns = await mapTransactionsWithCategories(visible, categories);

            return {
                transactions: enrichedTxns,
                hasMore: transactions.length > limit
            };
        }).subscribe(result => {
            update(s => ({
                ...s,
                transactions: result.transactions,
                hasMore: result.hasMore,
                loading: false
            }));
        });
    }

    async function loadMore() {
        let shouldLoad;

        update(s => {
            if (s.loading || !s.hasMore) return s;
            shouldLoad = true;

            return {
                ...s,
                loading: true
            };
        });

        if (!shouldLoad) return;

        currentLimit += BATCH_SIZE

        startLiveQuery(currentLimit);
    }

    startLiveQuery(currentLimit);

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

export async function getTransactionsBetweenDates(start, end) {
    const lowerBound = [0, start, Dexie.minKey];
    const upperBound = [0, end, Dexie.maxKey];
    
    return db.transactions
        .where('[deleted+date+uuid]')
        .between(lowerBound, upperBound, true, true)
        .toArray();
}
