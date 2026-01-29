export function indexByUuid(items) {
    const map = {};
    for (const item of items) {
        map[item.uuid] = item;
    }
    return map;
}

export function summariseByCategory(transactions) {
    const summary = {};
    for (const tx of transactions) {
        summary[tx.categoryUuid] ??= 0;
        summary[tx.categoryUuid] += tx.amount;
    }

    return summary;
}

export function groupTransactionsByDay(transactions) {
    const days = {};
    for (const tx of transactions) {
        const day = new Date(tx.date).toISOString().slice(0, 10);
        days[day] ??= [];
        days[day].push(tx);
    }
    return days;
}

export function getAllDays(start, end) {
    const days = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
}