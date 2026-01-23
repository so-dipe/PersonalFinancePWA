<script>
    export let budget = {};
    export let categories = [];

    let categoryUuid = budget.categoryUuid || categories[0]?.uuid || "";
    let description = budget.description || "";
    let amount = budget.amount || 0;
    let periodUnit = budget.periodUnit || "month";
    let periodCount = budget.periodCount || 1;
    let startDate = budget.startDate || new Date().toISOString().slice(0, 10);
    
    let categoryName = categories.find(c => c.uuid === categoryUuid)?.name || "";
    let categoryTransactionType = categories.find(c => c.uuid === categoryUuid)?.transactionType || "";
    
</script>

<div>
    {categoryName} - {startDate} - {amount}
</div>