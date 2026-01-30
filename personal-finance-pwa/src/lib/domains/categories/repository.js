import { DEFAULT_CATEGORIES } from "$lib/constants/default.categories";
import { db } from "$lib/db";
import { makeFingerprint } from "./fingerprint";
import { Category } from "./model";
import { normalizeCategory } from "./normalize";
import { validateCategory } from "./rules";
import { v5 as uuidV5 } from "uuid";
import { SYSTEM_NAMESPACE } from "$lib/constants/constants";

export async function getOrCreateCategory(name, transactionType, options = {}) {
    const now = new Date().toISOString();

    const category = normalizeCategory(name, transactionType);
    validateCategory(category);

    const fingerprint = makeFingerprint(category);

    // 1. Try existing
    const existing = await db.categories
        .where('fingerprint')
        .equals(fingerprint)
        .first();

    if (existing) {
        return {
            uuid: existing.uuid,
            created: false
        };
    }

    // 2. Create
    try {
        await db.categories.add({
            ...category,
            fingerprint,
            system: options.system ? 1 : 0,
            createdAt: now,
            modifiedAt: now,
            deleted: 0,
            synced: options.system ? 1 : 0
        });

        return {
            uuid: category.uuid,
            created: true
        };
    } catch (e) {
        // 3. Race safety
        if (e.name === "ConstraintError") {
            const retry = await db.categories
                .where('fingerprint')
                .equals(fingerprint)
                .first();

            if (retry) {
                return {
                    uuid: retry.uuid,
                    created: false
                };
            }
        }

        throw { code: "CAT_SAVE_FAILED", meta: {} };
    }
}

export async function loadDefaultCategories() {
    const now = new Date().toISOString();

    for (const [key, cat] of Object.entries(DEFAULT_CATEGORIES)) {
        const uuid = uuidV5(`${key}:${cat.transactionType}`, SYSTEM_NAMESPACE);

        const existing = await db.categories
            .where("uuid")
            .equals(uuid)
            .first();

        if (existing) continue;

        const category = normalizeCategory(cat.name, cat.transactionType);

        await db.categories.add({
            uuid,
            fingerprint: makeFingerprint(category),
            name: cat.name,
            transactionType: cat.transactionType,
            system: 1,
            createdAt: now,
            modifiedAt: now,
            deleted: 0,
            synced: 1
        });
    }
}

export async function addCategory(name, transactionType) {
    const result = await getOrCreateCategory(name, transactionType);
    
    if (!result.created) {
        throw { code: 'CAT_DUPLICATE'};
    }

    return result;
}

export async function editCategory(idOrUuid, updates) {
    const cat = await db.categories.get(idOrUuid);
    if (!cat) throw { code: "CAT_NOT_FOUND" };

    const transactionType = updates.transactionType ?? cat.transactionType;
    const normalized = normalizeCategory(updates.name ?? cat.name, transactionType);

    const fingerprint = makeFingerprint(normalized);

    const collision = await db.categories
        .where("fingerprint")
        .equals(fingerprint)
        .and(c => c.id !== cat.id)
        .first();
    
    if (collision) {
        throw { code: "CAT_DUPLICATE" };
    }

    await db.categories.update(cat.id, {
        ...cat,
        ...updates,
        fingerprint,
        modifiedAt: new Date().toISOString(),
        synced: 0
    });
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

function collectCategoryCandidates(transactions) {
    const map = new Map();

    for (const tx of transactions) {
        if (!tx.rawCategory) continue;

        const category = normalizeCategory(tx.rawCategory, tx.transactionType);

        const fingerprint = makeFingerprint(category);

        map.set(fingerprint, {
            name: category.name,
            transactionType: category.transactionType
        });
    }

    return map;
}

export async function detectNewCategories(transactions) {
    const candidates = collectCategoryCandidates(transactions);

    const existing = await db.categories
        .where("fingerprint")
        .anyOf([...candidates.keys()])
        .toArray();
    
    const existingFingerprints = new Set(
        existing.map(c => c.fingerprint)
    )

    return [...candidates.entries()]
        .filter(([fp]) => !existingFingerprints.has(fp))
        .map(([, cat]) => cat);
}