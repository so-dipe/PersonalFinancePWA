import { db } from "$lib/db";
import { liveQuery } from "dexie";
import { makeFingerprint } from "./fingerprint";
import { normalizeTransaction } from "./normalize";
import { validateTransaction } from "./rules";

export async function addTransaction(tx) {
    const transaction = normalizeTransaction(tx);
    validateTransaction(transaction);

    const fingerprint = makeFingerprint(transaction);

    try {
        await db.transactions.add({
            ...transaction,
            fingerprint,
            synced: 0,
            deleted: 0,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString()
        });
        return { ok: true }
    } catch (e) {
        if (e.name === 'ConstraintError') {
            const existing = await db.transaction.where('fingerprint').equals(fingerprint).first();
            throw { 'code': "TX_DUPLICATE", meta: { id: existing?.id }};
        }
        throw { 'code': "TX_SAVE_FAILED", meta: {error: e} }
    }
}

export async function addTransactionBulk(transactions) {
    const now = new Date().toISOString();

    const rows = transactions.map(tx => {
        const transaction = normalizeTransaction(tx);
        validateTransaction(transaction);

        return {
            ...transaction,
            fingerprint: makeFingerprint(transaction),
            synced: 0,
            deleted: 0,
            createdAt: now,
            modifiedAt: now
        };
    });

    try {
        const keys = await db.transactions.bulkAdd(rows, { allKeys: true });
        return { ok: true, keys }
    } catch (e) {
        if (e.name === 'BulkError') {
            const duplicates = [];

            for (const failure of e.failures) {
                if (failure.name === 'ConstraintError') {
                    const row = rows[failure.pos];
                    const existing = await db.transactions.where('fingerprint').equals(row.fingerprint).first();
                    if (existing) duplicates.push(existing.id);
                }
            }
            throw { code: 'TX_DUPLICATE', meta: { duplicates } };
        }
        throw { code: 'TX_BULK_FAILED', meta: {} };
    }
}

export async function editTransaction(idOrUuid, updates) {
    const tx = await db.transactions.get(idOrUuid);
    if (!tx) throw { code: 'TX_NOT_FOUND' };

    const updatedTx = normalizeTransaction({ ...tx, ...updates });
    validateTransaction(updatedTx);

    try {
        await db.transactions.update(tx.id, {
            ...updatedTx,
            fingerprint: makeFingerprint(updatedTx),
            modifiedAt: new Date().toISOString(),
            synced: 0
        });
    } catch (e) {
        if (e.name === 'ConstraintError') throw { code: 'TX_DUPLICATE_EDIT', meta: {} }
        throw { code: 'TX_EDIT_FAILED', meta: {} };
    }
}

export async function deleteTransaction(idOrUuid) {
    const tx = await db.transactions.get(idOrUuid);
    if (!tx) throw { code: 'TX_NOT_FOUND'};

    try {
        await db.transactions.update(idOrUuid, {
            deleted: 1,
            synced: 0,
            modifiedAt: new Date().toISOString()
        });
    } catch (e) {
        throw { code: 'TX_DELETE_FAILED', meta: {} };
    }
}

export async function checkExistingFingerprints(fingerprints) {
    try {
        const rows = await db.transactions
            .where('fingerprint')
            .anyOf(fingerprints)
            .toArray();
        return rows.map(r => r.fingerprint);
    } catch(e) {
        throw { code: "CHECK_FINGERPRINT_FAILED", meta: {error: e}};
    }
}