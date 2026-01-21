import { TRANSACTION_TYPES } from "$lib/constants/constants";
import { isValidISODate } from "$lib/utils";

export function validateTransaction(tx) {
    if (!isValidISODate(tx.date)) throw new Error('Transaction must have a valid date');
    if (!tx.amount || tx.amount <= 0) throw new Error('Transaction amount must be > 0');
    if (!TRANSACTION_TYPES.includes(tx.transactionType)) throw new Error('Transaction type invalid');
    if (!tx.categoryUuid) throw new Error('Transaction must belong to a category');
}