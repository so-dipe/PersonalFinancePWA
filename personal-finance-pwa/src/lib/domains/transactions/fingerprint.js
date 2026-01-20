export function makeFingerprint(tx) {
    return [
        tx.date,
        tx.transactionType,
        tx.description,
        tx.amount,
        tx.categoryUuid
    ].join('|');
}