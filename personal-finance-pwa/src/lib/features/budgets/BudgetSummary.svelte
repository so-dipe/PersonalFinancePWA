<script>
    import { createEventDispatcher } from "svelte";
    import { formatFinancial, formatDate } from "$lib/utils"; // make sure formatDate exists
    import { TRANSACTION_TYPE_LABELS } from "$lib/constants/constants";

    const dispatch = createEventDispatcher();

    export let budget;
    export let categoryName = "";
    export let transactionType = "";
    export let start; // start date of reporting period
    export let end;   // end date of reporting period

    function edit() {
        dispatch("edit", budget);
    }

    function del() {
        dispatch("delete", budget);
    }
</script>

<div class="summary">
    <div class="header">
        <div class="title">
            <strong>{categoryName}</strong>
            <span 
                class="badge"
                class:income={transactionType === 'income'}
                class:expense={transactionType === 'expense'}
            >
                {TRANSACTION_TYPE_LABELS[transactionType]}
            </span>
        </div>

        <div class="actions">
            <button class="action-text edit" on:click={edit}>Edit</button>
            <button class="action-text delete" on:click={del}>Delete</button>
        </div>
    </div>

    {#if budget.description}
    <div class="description">
        {budget.description}
    </div>
    {/if}

    <div class="meta">
        <span class="amount">{formatFinancial(budget.amount)}</span>
        <span class="period">
            {#if start && end}
                {formatDate(start)} ➡️ {formatDate(end)}
            {/if}
        </span>
    </div>
</div>

<style>
.summary {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.title {
    display: flex;
    gap: var(--space-xs);
    align-items: center;
}

.description {
    font-size: 0.85rem;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; /* or normal if you want multi-line */
}

.actions {
    display: flex;
    gap: var(--space-sm);
    font-size: 0.85rem;
}

/* make buttons look like text */
.action-text {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-weight: 500;
    transition: color 0.2s ease, transform 0.1s ease;
}

.action-text:hover {
    text-decoration: underline;
    transform: translateY(-1px);
}

/* specific personality */
.action-text.edit {
    color: var(--blue-600);
}

.action-text.delete {
    color: var(--red-600);
}

.action-text.delete:hover {
    color: var(--red-800);
}

.meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
}

.amount {
    font-weight: 600;
}

.badge {
    background: var(--gray-200);
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.8rem;
}

.badge.income {
    background: var(--green-200);
    color: var(--green-900);
}

.badge.expense {
    background: var(--red-100);
    color: var(--red-700);
}
</style>
