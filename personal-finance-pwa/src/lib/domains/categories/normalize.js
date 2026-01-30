import { Category } from "./model";

export function normalizeCategory(name, transactionType) {
    return new Category({
        name: name.trim(),
        transactionType: transactionType.trim().toLowerCase()
    })
}