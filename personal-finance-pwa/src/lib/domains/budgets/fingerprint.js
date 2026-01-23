export function makeFingerprint(budget) {
    return [
        budget.categoryUuid,
        budget.periodUnit,
        budget.periodCount,
        budget.startDate
    ].join('|');
}