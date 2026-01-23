export function makeFingerprint(budget) {
    console.log(budget);
    return [
        budget.categoryUuid,
        budget.description,
        budget.amount,
        budget.periodUnit,
        budget.periodCount,
        budget.startDate
    ].join('|');
}