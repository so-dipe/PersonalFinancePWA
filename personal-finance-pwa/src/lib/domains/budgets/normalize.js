import { Budget } from "./model";

function normalizeDate(date) {
    if (typeof date === "string") return date;
    return new Date(date).toISOString().slice(0, 10);
}

export function normalizeBudget(budget) {
    return new Budget({
        categoryUuid: budget.categoryUuid,
        description: budget.description?.trim(),
        amount: Math.abs(Number(budget.amount)),
        periodUnit: budget.periodUnit,
        periodCount: budget.periodCount,
        startDate: normalizeDate(budget.startDate)
    })
}