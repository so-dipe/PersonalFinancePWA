export class Category {
    constructor({
        id,
        uuid,
        name,
        transactionType
    }) {
        this.id = id;
        this.uuid = uuid ?? crypto.randomUUID();
        this.name = name ?? '';
        this.transactionType = transactionType;
    }
}