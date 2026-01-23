export class Budget {
    constructor({
        uuid,
        categoryUuid,
        description,
        amount,
        periodUnit,
        periodCount,
        startDate
    }) {
        this.uuid = uuid ?? crypto.randomUUID();
        this.categoryUuid = categoryUuid;
        this.description = description;
        this.amount = amount || 0;
        this.periodUnit = periodUnit;
        this.periodCount = periodCount;
        this.startDate = startDate;
    }
}