export function makeFingerprint(budget) {
    return [
        budget.categoryUuid,
        budget.description,
        budget.amount,
        budget.periodUnit,
        budget.periodCount,
        budget.startDate
    ].join('|');
}