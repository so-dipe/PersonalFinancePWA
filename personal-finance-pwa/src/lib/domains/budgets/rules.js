import { BUDGET_PERIODS } from "$lib/constants/constants";
import { isValidISODate } from "$lib/utils";

export function validateBudget(budget) {
    if (!budget.categoryUuid) throw new Error('Budget must belong to a category');
    if (!isValidISODate(budget.startDate)) throw new Error('Budget must have a valid start date');
    if (!Object.keys(BUDGET_PERIODS).includes(budget.periodUnit)) throw new Error('Budget must be for a valid period');
    if (!budget.periodCount) throw new Error('Budget must have a budget count');
    if (!budget.amount || budget.amount <= 0) throw new Error('Budget amount must be > 0');
}