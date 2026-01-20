import { db } from "$lib/db";

export async function getActiveCategories() {
    const cats = await db.categories.where("deleted").equals(0).toArray();
    return cats.map(c => ({ ...c, transactionType: c.transactionType.toLowerCase() }));
}