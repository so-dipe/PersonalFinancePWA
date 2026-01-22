export class Budget {
    constructor({
        uuid,
        categoryUuid,
        amount,
        periodUnit,
        periodCount,
        startDate
    }) {
        this.uuid = uuid ?? crypto.randomUUID();
        this.categoryUuid = categoryUuid;
        this.amount = amount || 0;
        this.periodUnit = periodUnit;
        this.periodCount = periodCount;
        this.startDate = startDate;
    }
}