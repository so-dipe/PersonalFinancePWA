export function dailyTotals(dailyData, selectedCategoryUuids = null) {
    return dailyData.map(day => {
        const total = day.categories.reduce((sum, c) => {
            if (!selectedCategoryUuids || selectedCategoryUuids.includes(c.category.uuid)) {
                sum += c.total;
            }
            return sum;
        }, 0);
        return {
            date: day.date,
            total
        }
    });
}

export function averagePerDay(dailyData, selectedCategoryUuids = null) {
    if (dailyData.length === 0) return 0;

    const total = dailyData.reduce((sum, day) => {
        const dayTotal = day.categories.reduce((daySum, c) => {
            if (!selectedCategoryUuids || selectedCategoryUuids.includes(c.category.uuid)) {
                daySym += c.total;
            }
            return daySum;
        }, 0);
        return sum + dayTotal;
    }, 0);
    return total / dailyData.length;

}