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
        &fingerprint,
        name,
        transactionType,
        createdAt,
        modifiedAt,
        deleted,
        synced
    `,
    settings: `
        ++id,
        uuid,
        key,
        value,
        createdAt,
        modifiedAt,
        deleted,
        synced
    `
});

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

const defaultSettings = {
    sync: {
        enabled: false,
        autoSync: false,
        lastSync: "1970-01-01"
    },
    
    account: {
        name: "random",
        email: "random@example.com",
        picture: "/avatar.png",
        setBy: "system"
    },

    display: {
        darkMode: false
    }
}

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
            const existing = await db.transactions.where("fingerprint").equals(fingerprint).first();
            throw { code: "TX_DUPLICATE", meta: { id: existing?.id} };
        }
        throw { code: "TX_SAVE_FAILED", meta: {} };
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

//CATEGORY
export function makeCategoryFingerprint(name, transactionType) {
    return `${name.trim().toLowerCase()}|${transactionType}`;
}

export async function loadDefaultCategories() {

    for (const [name, transactionType] of Object.entries(defaultCategories)) {
        const existing = await db.categories.where('name').equals(name).first();
        if (!existing) {
            await db.categories.add({
                uuid: crypto.randomUUID(),
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

export async function addCategory(name, transactionType) {
    const fingerprint = makeCategoryFingerprint(name, transactionType)
    const existing = await db.categories.where('fingerprint').equals(fingerprint).first();

    if (existing) return existing.uuid;

    await db.categories.add({
        uuid: crypto.randomUUID(),
        name: name,
        transactionType: transactionType,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        deleted: 0,
        synced: 0
    });

    return uuid;
}

//SETTINGS

export async function loadDefaultSettings() {
    const settings = db.settings.toArray()
    if (settings.length ==! 0) return;
    for (const [key, value] of Object.entries(defaultSettings)) {
        const existing = await db.settings.where('key').equals(key).first();
        if (existing) continue;
        await db.settings.add({
            uuid: key,
            key: key,
            value: value,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            synced: 0,
            deleted: 0
        });
    };
}

export async function getSetting(key) {
    const record = await db.settings.get({ key });
    if (!record) {
        const defaultValue = defaultSettings[key];
        if (defaultValue === undefined) {
            throw new Error(`Unknown setting key: ${key}`)
        }
        await setSetting(key, defaultValue);
        return defaultValue;
    }
    return record.value;
}

export async function setSetting(key, value) {
    const now = new Date().toISOString()
    const existing = await db.settings.get({ key });
    if (existing) {
        await db.settings.update(existing.id, {
            value,
            modifiedAt: now,
            synced: 0
        });
    } else {
        await db.settings.add({
            uuid: key,
            key,
            value,
            createdAt: now,
            modifiedAt: now,
            synced: 0,
            deleted: 0
        });
    };
}

export function useSetting(key) {
    const fallback = defaultSettings[key]

    if (fallback === undefined) {
        throw new Error(`Unknown setting key: ${key}`);
    }

    return liveQuery(async () => {
        const record = await db.settings.get({ key });
        return record?.value ?? fallback;
    });
}