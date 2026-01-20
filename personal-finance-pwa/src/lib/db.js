import Dexie from "dexie";

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
        categoryUuid,
        source,
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
    `,
    budgets: `
        ++id,
        uuid,
        categoryId,
        amount,
        periodUnit,
        periodCount,
        startDate,
        createdAt,
        modifiedAt,
        deleted,
        synced
    `
});