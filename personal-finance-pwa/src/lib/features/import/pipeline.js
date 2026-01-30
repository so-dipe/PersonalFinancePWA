function makeSimilarityKey(tx) {
    return [
        tx.transactionType,
        tx.date,
        tx.amount,
        tx.description?.toLowerCase().trim(),
        tx.rawCategory
    ].join("|");
}

export async function runImportPipeline(rawTransactions) {
    const normalized = rawTransactions.map(tx => {
        return {
            ...tx,
            status: 'pending',
            similarityKey: makeSimilarityKey(tx)
        };
    });

    const seen = new Set();
    for (const tx of normalized) {
        if (seen.has(tx.similarityKey)) {
            tx.status = 'duplicate-file';
        } else {
            seen.add(tx.similarityKey);
        }
    }

    for (const tx of normalized) {
        if (tx.status === 'pending') {
            tx.status = 'ready';
        }
    }

    return normalized;
}