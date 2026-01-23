import { db } from "$lib/db";
import { makeFingerprint } from "./fingerprint";
import { normalizeBudget } from "./normalize";
import { validateBudget } from "./rules";

export async function addBudget(bdgt) {
    const budget = normalizeBudget(bdgt);
    validateBudget(budget);

    const fingerprint = makeFingerprint(budget);
    console.log(fingerprint);

    try {
        await db.budgets.add({
            ...budget,
            fingerprint,
            synced: 0,
            deleted: 0,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString()
        });
        return { ok: true}
    } catch (e) {
        if (e.name === 'ConstraintError') {
            const existing = await db.budgets.where('fingerprint').equals(fingerprint).first();
            console.log(existing);
            throw { 'code': "BUDGET_DUPLICATE", meta: { id: existing?.id, uuid: existing?.uuid }};
        }
        throw { 'code': "BUDGET_SAVE_FAILED", meta: {error: e} }
    }
}

export async function editBudget(idOrUuid, updates) {
    const budget = await db.budgets.get(idOrUuid);
    if (!budget) throw { code: 'BUDGET_NOT_FOUND'};

    const updatedBudget = normalizeBudget({ ...budget, ...updates });
    validateBudget(updatedBudget);

    try {
        await db.budgets.update(budget.id, {
            ...updatedBudget,
            fingerprint: makeFingerprint(updatedBudget),
            modifiedAt: new Date().toISOString(),
            synced: 0
        });
    } catch (e) {
        if (e.name === 'ConstraintError') throw { code: 'BUDGET_DUPLICATE_EDIT', meta: {} }
        throw { code: 'BUDGET_EDIT_FAILED', meta: {} };
    }
}

export async function deleteBudget(idOrUuid) {
    const budget = await db.budgets.get(idOrUuid);
    if (!budget) throw { code: 'BUDGET_NOT_FOUND'};

    try {
        await db.budgets.update(idOrUuid, {
            deleted: 1,
            synced: 0,
            modifiedAt: new Date().toISOString()
        });
    } catch (e) {
        throw { code: 'BUDGET_DELETE_FAILED', meta: {} };
    }
}