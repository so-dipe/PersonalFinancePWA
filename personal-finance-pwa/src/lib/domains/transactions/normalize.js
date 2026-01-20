import { Transaction } from "./model";

function normalizeDate(date) {
    if (typeof date === "string") return date;
    return new Date(date).toISOString().slice(0, 10);
}

export function normalizeTransaction(tx) {
    return new Transaction({
        date: normalizeDate(tx.date),
        transactionType: tx.transactionType?.trim().toLowerCase(),
        description: tx.description,
        amount: Math.abs(Number(tx.amount)),
        categoryUuid: tx.categoryUuid,
        source: tx.source
    })
}