import Dexie from "dexie";
import { loadDefaultCategories } from "./domains/categories";

export const db = new Dexie("FinanceDB")

const baseSchema = {
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
}

db.version(1).stores(baseSchema);

db.version(2).stores({
    ...baseSchema,
    transactions: baseSchema.transactions + ", [deleted+date]"
});

db.version(3).stores({
    ...baseSchema,
    transactions: baseSchema.transactions + ", [deleted+date+uuid]"
});

db.on("populate", loadDefaultCategories);
db.on("ready", async () => {
    const exists = await db.categories.limit(1).count();
    if (!exists) {
        await loadDefaultCategories();
    }
});