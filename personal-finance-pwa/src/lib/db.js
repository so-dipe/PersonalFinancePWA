import Dexie from "dexie";

export const db = new Dexie("FinanceDB")

db.version(1).stores({
    transactions: '++id, uuid, date, transactionType, description, amount, category, synced, deleted, createdAt, modifiedAt',
    categories: '++id, uuid, name, createdAt, modifiedAt, deleted, synced'
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