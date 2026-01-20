import { DEFAULT_CATEGORIES } from "$lib/constants/default.categories";
import { db } from "$lib/db";
import { makeFingerprint } from "./fingerprint";
import { Category } from "./model";
import { normalizeCategory } from "./normalize";
import { validateCategory } from "./rules";

export async function loadDefaultCategories() {
    const now = new Date().toISOString();

    for (const [name, transactionType] of Object.entries(DEFAULT_CATEGORIES)) {
        const category = normalizeCategory(name, transactionType)
        const fingerprint = makeFingerprint(category);
        const existing = await db.categories.where("fingerprint").equals(fingerprint).first();

        if (existing) continue;

        await db.categories.add({
            uuid: crypto.randomUUID(),
            fingerprint,
            name,
            transactionType,
            createdAt: now,
            modifiedAt: now,
            deleted: 0,
            synced: 0
        });
    }
}

export async function addCategory(name, transactionType) {
    const category = normalizeCategory(name, transactionType);
    validateCategory(category);

    const fingerprint = makeFingerprint(category);
    const existing = await db.categories.where('fingerprint').equals(fingerprint).first();
    if (existing) throw { code: 'CAT_DUPLICATE', meta: { id: existing.id } }

    try {
        const id = await db.categories.add({
            ...category,
            fingerprint,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            deleted: 0,
            synced: 0
        });
        return { ok: true, id, uuid: category.uuid };
    } catch (e) {
        if (e.name === 'ConstraintError') throw { code: "CAT_DUPLICATE", meta: {} };
        throw { code: "CAT_SAVE_FAILED", meta: {} };
    }
}

export async function editCategory(idOrUuid, updates) {
    const cat = await db.categories.get(idOrUuid);
    if (!cat) throw { code: "CAT_NOT_FOUND" };

    const transactionType = updates.transactionType ? updates.transactionType : cat.transactionType;
    const category = normalizeCategory(updates.name ?? cat.name, transactionType);

    const updated = {
        ...cat,
        ...updates,
        fingerprint: makeFingerprint(category),
        modifiedAt: new Date().toISOString(),
        synced: 0
    }
    await db.categories.update(cat.id, updated)
}

export async function deleteCategory(idOrUuid) {
    const cat = await db.categories.get(idOrUuid);
    if (!cat) throw { code: "CAT_NOT_FOUND"};

    await db.categories.update(cat.id, {
        deleted: 1,
        modifiedAt: new Date().toISOString(),
        synced: 0
    });
}