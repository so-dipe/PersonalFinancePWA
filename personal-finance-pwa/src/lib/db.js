import Dexie, { liveQuery } from "dexie";

export const db = new Dexie("FinanceDB")

db.version(1).stores({
    transactions: `
        ++id,
        uuid,
        &fingerprint,
        date,
        transactionType,
        description,
        amount,
        category,
        source,
        importBatchId,
        synced,
        deleted,
        createdAt,
        modifiedAt
    `,
    categories: `
        ++id,
        uuid,
        name,
        transactionType,
        createdAt,
        modifiedAt,
        deleted,
        synced
    `,
    settings: `
        key,
        value
    `
})

export function normalize(tx) {
    return {
        ...tx,
        description: tx.description.trim().toLowerCase(),
        amount: Math.abs(Number(tx.amount)) || 0,
        date: new Date(tx.date).toISOString().slice(0, 10)
    }
}

export function makeFingerprint(tx) {
    const n = normalize(tx);
    return `${n.date}|${n.amount}|${n.description}|${n.transactionType}|${n.category}`
}
export async function addTransaction(tx) {
    const fingerprint = makeFingerprint(tx);
    try {
        await db.transactions.add({
            uuid: crypto.randomUUID(),
            fingerprint,
            date: tx.date,
            transactionType: tx.transactionType,
            description: tx.description,
            amount: parseFloat(Math.abs(tx.amount)),
            category: tx.category ?? null,
            source: tx.source ?? 'manual',
            sourceMeta: tx.sourceMeta ?? null,
            importBatchId: tx.importBatchId ?? null,
            synced: 0,
            deleted: 0,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString()
        })

        return { ok: true };
    } catch (e) {
        if (e.name === 'ConstraintError') {
            return { ok: false, reason: 'duplicate'};
        }
        throw e;
    }
}

export async function addTransactionsBulk(transactions) {
    const now = new Date().toISOString();

    const rows = transactions.map(tx => ({
        uuid: crypto.randomUUID(),
        fingerprint: makeFingerprint(tx),
        date: tx.date,
        transactionType: tx.transactionType,
        description: tx.description,
        amount: parseFloat(Math.abs(tx.amount)),
        category: tx.category ?? null,
        source: tx.source,
        sourceMeta: tx.sourceMeta ?? null,
        importBatchId: tx.importBatchId ?? null,
        synced: 0,
        deleted: 0,
        createdAt: now,
        modifiedAt: now
    }));

    return db.transactions.bulkAdd(rows, { allKeys: true })
}

export async function checkExistingFingerprints(fingerprints) {
    return db.transactions
        .where('fingerprint')
        .anyOf(fingerprints)
        .toArray()
        .then(rows => rows.map(r => r.fingerprint))
}

export async function editTransaction(idOrUuid, updates ) {
    const tx = await db.transactions.get(idOrUuid);
    if (!tx) throw new Error("Transaction Not Found");

    const updated = {
        ...tx,
        ...updates,
        fingerprint: makeFingerprint({...tx, ...updates}),
        modifiedAt: new Date().toISOString(),
        synced: 0
    }

    await db.transactions.update(tx.id, updated);
}

export async function deleteTransaction(idOrUuid) {
    const tx = await db.transactions.get(idOrUuid);
    if (!tx) throw new Error("Transaction Not Found");

    await db.transactions.update(idOrUuid, {
        deleted: 1,
        synced: 0,
        modifiedAt: new Date().toISOString()
    })
}

export async function getFrequentTransactions(limit = 10) {
    return liveQuery(() =>
        db.transactions
            .where('deleted')
            .equals(0)
            .toArray()
            .then(transactions => {
                const frequencyMap = {};
                for (const tx of transactions) {
                    const key = JSON.stringify({
                        transactionType: tx.transactionType,
                        description: tx.description,
                        amount: tx.amount,
                        category: tx.category
                    });
                    frequencyMap[key] = (frequencyMap[key] || 0) + 1;
                }
                const sortedTransactions = Object.entries(frequencyMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, limit)
                    .map(([key]) => JSON.parse(key));
                return sortedTransactions;
            })
    );
}

export async function isDuplicateTransaction(transaction) {
    const transactions = await db.transactions
        .where('deleted')
        .equals(0)
        .filter(tx =>
            tx.date === transaction.date &&
            tx.transactionType === transaction.transactionType &&                
            tx.description === transaction.description &&
            tx.amount === transaction.amount &&
            tx.category === transaction.category
        )
        .toArray()
    return transactions.length > 0;
}

export async function loadDefaultCategories() {
    const defaultCategories = {
        "Salary" : "Income",
        "Freelance" : "Income",
        "Investment Income/Withdrawal" : "Income",
        "Gift" : "Income",
        "Rent" : "Expense",
        "Food" : "Expense",
        "Transport" : "Expense",
        "Utilities" : "Expense",
        "Entertainment" : "Expense",
        "Healthcare" : "Expense",
        "Education" : "Expense",
        "Shopping" : "Expense",
        "Travel" : "Expense",
        "Miscellaneous" : "Expense",
        "Savings" : "Expense"
    };

    for (const [name, transactionType] of Object.entries(defaultCategories)) {
        const existing = await db.categories.where('name').equals(name).first();
        if (!existing) {
            await db.categories.add({
                uuid: name.toLowerCase().replace(/\s+/g, '-'),
                name: name,
                transactionType: transactionType,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                deleted: 0,
                synced: 0
            });
        }
    }
}

export async function addCategory(name) {
    await db.categories.add({
        uuid: crypto.randomUUID(),
        name: name,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        deleted: 0,
        synced: 0
    });
}