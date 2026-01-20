export function makeFingerprint(category) {
    return [
        category.name,
        category.transactionType
    ].join('|');
}