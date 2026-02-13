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

    const sections = ['income', 'expense'];

    let openAccordions = new Set(sections);

    $: isEditing = !!draftBudget || !!editingBudget;

    $: sectionBudgets = sections.reduce((acc, type) => {
        acc[type] = $budgets?.filter(b => b.categoryTransactionType === type) ?? [];
        return acc;
    }, {});

    $: sectionCategories = sections.reduce((acc, type) => {
        acc[type] = $categories?.filter(c => c.transactionType === type) ?? [];
        return acc;
    }, {});

    function toggleAccordion(type) {
        if (openAccordions.has(type)) {
            openAccordions.delete(type);
        } else {
            openAccordions.add(type);
        }
        openAccordions = new Set(openAccordions); 
    }

    async function addBudgetHandler(transactionType) {
        const cats = await getActiveCategories();
        const defaultCategory = cats.find(c => c.transactionType === transactionType);
        if (!defaultCategory) {
            notify({type: "error", message: "No default category found."});
            return;
        }
        draftBudget = {
            ...getDefaultBudgetForm(),
            categoryUuid: defaultCategory.uuid,
            categoryTransactionType: transactionType
        };
    }

    async function handleCreateSave(event) {
        try {
            await addBudget(event.detail);
        } catch (e) {
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
            errorToNotification(e);
        } finally {
            editingBudget = null;
        }
    }

    async function handleDelete(event) {
        try {
            await deleteBudget(event.detail?.uuid);
        } catch (e) {
            errorToNotification(e);
        }
    }
</script>



<div class="manage-budgets">
    {#each sections as type}
        <BudgetsAccordion
            title={type === 'income' ? 'Income' : 'Expense'}
            open={openAccordions.has(type)}
            on:toggle={() => toggleAccordion(type)}
        >
            <div class="budget-list">
                {#each sectionBudgets[type] as budget (budget.uuid)}
                    {#if editingBudget?.uuid === budget.uuid}
                        <Budget
                            budget={editingBudget}
                            mode="edit"
                            categories={sectionCategories[type]}
                            on:save={handleEditSave}
                            on:cancel={() => { editingBudget = null; }}
                        />
                    {:else}
                        <Budget
                            budget={budget}
                            mode="view"
                            categories={sectionCategories[type]}
                            on:edit={() => handleEdit({ detail: budget })}
                            on:delete={handleDelete}
                        />
                    {/if}
                {/each}

                {#if draftBudget && draftBudget.categoryTransactionType === type}
                    <Budget
                        budget={draftBudget}
                        mode="create"
                        categories={sectionCategories[type]}
                        on:save={handleCreateSave}
                        on:cancel={handleCreateCancel}
                    />
                {/if}
            </div>

            <button class="add-budget" on:click={() => addBudgetHandler(type)} disabled={isEditing}>
                + Add {type === 'income' ? 'Income' : 'Expense'} Budget
            </button>
        </BudgetsAccordion>
    {/each}
</div>


<style>
.manage-budgets {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

.manage-budgets > :global(.accordion) + :global(.accordion)::before {
    content: '';
    display: block;
    height: 1px;
    background: var(--bg-muted);
    margin: var(--space-lg) 0;
}


.budget-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
}

.add-budget {
    margin-top: var(--space-sm);
    background: none;
    border: 1px dashed var(--green-500);
    color: var(--green-700);
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s, color 0.2s;
    width: 100%;
}

.add-budget:hover {
    background: var(--green-50);
}

.add-budget:disabled {
    color: var(--text-muted);
    border-color: var(--bg-muted);
    cursor: not-allowed;
    background: var(--bg-muted);
}
</style>
