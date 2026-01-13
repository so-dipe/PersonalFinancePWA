import Dexie, { liveQuery } from "dexie";

export const db = new Dexie("FinanceDB")

db.version(1).stores({
    transactions: '++id, uuid, date, transactionType, description, amount, category, synced, deleted, createdAt, modifiedAt',
    categories: '++id, uuid, name, transactionType, createdAt, modifiedAt, deleted, synced'
})

export async function addTransaction(date, transactionType, description, amount, category) {
    await db.transactions.add({
        uuid: crypto.randomUUID(),
        date: date,
        transactionType: transactionType,
        description: description,
        amount: parseFloat(amount),
        category: category,
        synced: 0,
        deleted: 0,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
    })
}

export async function editTransaction(idOrUuid, { date, transactionType, description, amount, category } ) {
    const tx = await db.transactions.get(idOrUuid);
    if (!tx) throw new Error("Transaction Not Found");

    await db.transactions.update(tx.id, {
        date,
        transactionType,
        description,
        amount,
        category,
        modifiedAt: new Date().toISOString(),
        synced: 0
    });
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