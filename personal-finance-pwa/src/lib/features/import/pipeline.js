import { makeFingerprint, checkExistingFingerprints, normalizeTransaction } from "$lib/domains/transactions";

export async function runImportPipeline(rawTransactions) {
    const normalized = rawTransactions.map(tx => {
        const n = normalizeTransaction(tx);
        return {
            ...n,
            fingerprint: makeFingerprint(n),
            status: 'pending'
        };
    });

    const seen = new Set();
    for (const tx of normalized) {
        if (seen.has(tx.fingerprint)) {
            tx.status = 'duplicate-file';
        } else {
            seen.add(tx.fingerprint);
        }
    }

    const fingerprints = normalized.map(t => t.fingerprint);
    const existing = await checkExistingFingerprints(fingerprints);
    const existingSet = new Set(existing);

    for (const tx of normalized) {
        if (existingSet.has(tx.fingerprint)) {
            tx.status = 'duplicate-db';
        }
    }

    for (const tx of normalized) {
        if (tx.status === 'pending') {
            tx.status = 'ready';
        }
    }

    return normalized;
}