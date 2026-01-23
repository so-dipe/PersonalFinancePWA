<script>
    import Budget from './Budget.svelte';
    import BudgetsAccordion from './BudgetsAccordion.svelte';
    import { useBudgets, addBudget } from '$lib/domains/budgets';
    import { useCategories } from '$lib/domains/categories';
    import { getDefaultBudgetForm } from '$lib/utils';
    import { notify } from '$lib/stores/notification.store';

    const budgets = useBudgets();
    const categories = useCategories();

    $: incomeBudgets = $budgets?.filter(b => b.categoryTransactionType === 'income');
    $: expenseBudgets = $budgets?.filter(b => b.categoryTransactionType === 'expense');

    async function addBudgetHandler(transactionType) {
        const defaultCategory = $categories.find(c => c.transactionType === transactionType);
        console.log($categories);
        if (!defaultCategory) {
            console.error("No default category found");
            notify({type: "error", message: "An error occured."});
            return;
        }
        await addBudget({
            ...getDefaultBudgetForm(),
            categoryUuid: defaultCategory.uuid
        });
    }

</script>

<div>
    <BudgetsAccordion title="Income Budgets">
        {#each incomeBudgets as budget (budget.uuid)}
            <Budget
            {budget} 
            categories={$categories.filter(c => c.transactionType === 'income')}
            />
        {/each}
        <button on:click={() => addBudgetHandler('income')}>
            Add Income Budget
        </button>
    </BudgetsAccordion>
</div>