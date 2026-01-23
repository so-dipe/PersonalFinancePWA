<script>
    import Budget from './Budget.svelte';
    import BudgetsAccordion from './BudgetsAccordion.svelte';
    import { useBudgets, addBudget, editBudget, deleteBudget } from '$lib/domains/budgets';
    import { useCategories, getActiveCategories } from '$lib/domains/categories';
    import { getDefaultBudgetForm } from '$lib/utils';
    import { notify } from '$lib/stores/notification.store';
    import { errorToNotification } from '$lib/stores/notification.mapper';

    const budgets = useBudgets();
    const categories = useCategories();

    let draftBudget = null;
    let editingBudget = null;
    let openAccordion = 'income';

    const sections = ['income', 'expense'];

    $: isEditing = !!draftBudget || !!editingBudget;

    $: sectionBudgets = sections.reduce((acc, type) => {
        acc[type] = $budgets?.filter(b => b.categoryTransactionType === type);
        return acc;
    }, {});

    async function addBudgetHandler(transactionType) {
        const cats = await getActiveCategories();
        const defaultCategory = cats.find(c => c.transactionType === transactionType);
        if (!defaultCategory) {
            console.error("No default category found");
            notify({type: "error", message: "An error occured."});
            return;
        }
        draftBudget = {
            ...getDefaultBudgetForm(),
            categoryUuid: defaultCategory.uuid,
            categoryTransactionType: transactionType
        }
    }

    async function handleCreateSave(event) {
        try {
            await addBudget(event.detail);
        } catch (e) {
            console.error("An Error occured while saving");
            errorToNotification(e);
        } finally {
            draftBudget = null;
        }
    }

    function handleCreateCancel() {
        draftBudget = null;
    }

    function handleEdit(event) {
        editingBudget = structuredClone(event.detail);
    }

    async function handleEditSave(event) {
        try {
            await editBudget(event.detail?.uuid, event.detail);
        } catch (e) {
            console.error("An Error occured while saving");
            errorToNotification(e);
        } finally {
            editingBudget = null;
        }
    }

    async function handleDelete(event) {
        try {
            await deleteBudget(event.detail?.uuid);
        } catch (e) {
            console.error("An error occured during delete.")
            errorToNotification(e)
        }
    }

    function toggleAccordion(type) {
        openAccordion = type;
    }

</script>

<div>
    {#each sections as type}
    <BudgetsAccordion 
        title={type === 'income' ? 'Income': 'Expense'}
        open={openAccordion === type}
        on:toggle={() => toggleAccordion(type)}
    >
        {#each sectionBudgets[type] as budget (budget.uuid)}
            {#if editingBudget?.uuid === budget.uuid}
                <Budget
                    budget={editingBudget}
                    mode="edit"
                    categories={$categories.filter(c => c.transactionType === type)}
                    on:save={handleEditSave}
                    on:cancel={() => { editingBudget=null; isEditing=false; }}
                />
            {:else}
                <Budget
                    budget={budget}
                    mode="view"
                    categories={$categories.filter(c => c.transactionType === type)}
                    on:edit={(e) => handleEdit({detail: budget})}
                    on:delete={handleDelete}
                />
            {/if}
        {/each}
        {#if draftBudget && draftBudget.categoryTransactionType === type}
            <Budget
                budget={draftBudget}
                mode="create"
                categories={$categories.filter(c => c.transactionType === type)}
                on:save={handleCreateSave}
                on:cancel={handleCreateCancel}
            />
        {/if}
        <button on:click={() => addBudgetHandler(type)} disabled={isEditing}>
            Add {type === 'income' ? 'Income' : 'Expense'} Budget
        </button>
    </BudgetsAccordion>
    {/each}
</div>