import Dexie, { liveQuery } from "dexie";
import { db } from "$lib/db";
import { writable } from "svelte/store";
import { BATCH_SIZE } from "$lib/constants/constants";
import { getActiveCategories } from "../categories";

async function mapTransactionsWithCategories(transactions, categories) {
    const categoryMap = Object.fromEntries(
        categories.map(c => [c.uuid, c.name])
    );

    return transactions.map(tx => ({
        ...tx,
        category: categoryMap[tx.categoryUuid] ?? 'Unknown'
    }))
}

export function useLazyTransactions() {
    const { subscribe, set, update } = writable({
        transactions: [],
        loading: false,
        offset: 0,
        // lastDate: 0,
        hasMore: true,
    });

    async function loadMore() {
        let state;
        update(s => {
            state = s;
            return {...s, loading: true};
        });

        const categories = await getActiveCategories();

        // let collection = db.transactions
        //     .where('[deleted+date]')
        //     .between([0, Dexie.minKey], [0, Dexie.maxKey])
        //     .reverse();

        // if (state.lastDate) {
        //     collection = collection.filter(tx => tx.date < state.lastDate);
        // }

        // const nextBatch = await collection
        //     .limit(BATCH_SIZE)
        //     .toArray();

        // update(s => ({
        //     transactions: [...s.transactions, ...nextBatch],
        //     loading: false,
        //     lastDate: nextBatch.at(-1)?.date ?? s.lastDate,
        //     hasMore: nextBatch.length === BATCH_SIZE
        // }));

        const nextBatch = await db.transactions
            .where('[deleted+date]')
            .between([0, Dexie.minKey], [0, Dexie.maxKey])
            .reverse()
            .offset(state.offset)
            .limit(BATCH_SIZE)
            .toArray();

        const enriched = await mapTransactionsWithCategories(nextBatch, categories);

        update(state => ({
            transactions: [...state.transactions, ...enriched],
            loading: false,
            offset: state.offset + nextBatch.length,
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
                        amount: 0, //tx.amount,
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
