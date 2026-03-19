import Dexie from "dexie";

export const db = new Dexie("FinanceDB")

db.version(1).stores({
    transactions: `
        ++id, uuid, &fingerprint,
        date, transactionType, description, amount, categoryUuid,
        source,
        synced, deleted, createdAt, modifiedAt
    `,
    categories: `
        ++id, uuid, &fingerprint,
        name, transactionType,
        system,
        synced, deleted, createdAt, modifiedAt
    `,
    settings: `
        ++id, uuid,
        key, value,
        synced, deleted, createdAt, modifiedAt
    `,
    budgets: `
        ++id, uuid, &fingerprint,
        categoryUuid, description, amount,
        periodUnit, periodCount, startDate,
        synced, deleted, createdAt, modifiedAt
    `
});

db.version(2).stores({
    transactions: `
        ++id, uuid, &fingerprint,
        date, transactionType, description, amount, categoryUuid,
        source,
        synced, deleted, createdAt, modifiedAt,
        [deleted+date]
    `,
    categories: `
        ++id, uuid, &fingerprint,
        name, transactionType,
        system,
        synced, deleted, createdAt, modifiedAt
    `,
    settings: `
        ++id, uuid,
        key, value,
        synced, deleted, createdAt, modifiedAt
    `,
    budgets: `
        ++id, uuid, &fingerprint,
        categoryUuid, description, amount,
        periodUnit, periodCount, startDate,
        synced, deleted, createdAt, modifiedAt
    `
})