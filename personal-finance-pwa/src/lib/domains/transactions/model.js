export class Transaction {
    constructor({
        uuid,
        date,
        transactionType,
        description,
        amount,
        categoryUuid,
        source = 'manual'
    }) {
        this.uuid = uuid ?? crypto.randomUUID();
        this.date = date;
        this.transactionType = transactionType;
        this.description = description ?? '';
        this.amount = amount || 0;
        this.categoryUuid = categoryUuid ?? null;
        this.source = source;
    }
}