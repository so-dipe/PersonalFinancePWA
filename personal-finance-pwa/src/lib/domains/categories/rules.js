import { TRANSACTION_TYPES } from "$lib/constants/constants";

export function validateCategory(category) {
    if (!category.name) throw new Error("Category name is required.");
    if (!TRANSACTION_TYPES.includes(category.transactionType)) throw new Error("Category transactionType must be 'income' or 'expense'");
}