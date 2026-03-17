import { liveQuery } from "dexie";
import { db } from "$lib/db";
import { writable } from "svelte/store";
import { BATCH_SIZE } from "$lib/constants/constants";

export function useLazyTransactions() {
    const { subscribe, set, update } = writable({
        transactions: [],
        loading: false,
        offset: 0,
        hasMore: true,
    });

    async function loadMore() {
        update(state => ({...state, loading: true}));

        let state;
        update(s => {
            state = s;
            return s;
        });

        const txns = await db.transactions
            .where('deleted')
            .equals(0)
            .sortBy('createdAt');

        const nextBatch = txns.slice(state.offset, state.offset + BATCH_SIZE);

        update(state => ({
            transactions: [...state.transactions, ...nextBatch],
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
                
                const categories = await db.categories.toArray();
                const categoryMap = Object.fromEntries(categories.map(c => [c.uuid, c.name]));

                return sortedTransactions.map(tx => ({
                    ...tx,
                    category: categoryMap[tx.categoryUuid] ?? 'Unknown'
                }));
            })
    );
}

export function useRecentTransactions(limit) {
    return liveQuery(async () => {
        const [txs, categories] = await Promise.all([
            db.transactions
                .orderBy('date')
                .reverse()
                .filter(tx => tx.deleted === 0)
                .limit(limit)
                .toArray(),
            db.categories
                .where('deleted')
                .equals(0)
                .toArray()
        ]);
        const categoryMap = Object.fromEntries(
            categories.map(c => [c.uuid, c.name])
        );
        return txs.map(tx => ({
            id: tx.id,
            uuid: tx.uuid,
            date: tx.date,
            transactionType: tx.transactionType,
            description: tx.description,
            amount: tx.amount,
            category: categoryMap[tx.categoryUuid] ?? 'Unknown',
            synced: tx.synced
        }));
    });
}

export function useTransactions() {
    return liveQuery(async () => {
        const [txs, categories] = await Promise.all([
            db.transactions
                .orderBy('date')
                .reverse()
                .filter(tx => tx.deleted === 0)
                .toArray(),
            db.categories
                .where('deleted')
                .equals(0)
                .toArray()
        ]);
        const categoryMap = Object.fromEntries(
            categories.map(c => [c.uuid, c.name])
        );
        return txs.map(tx => ({
            id: tx.id,
            uuid: tx.uuid,
            date: tx.date,
            transactionType: tx.transactionType,
            description: tx.description,
            amount: tx.amount,
            category: categoryMap[tx.categoryUuid] ?? 'Unknown',
            synced: tx.synced
        }));
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
