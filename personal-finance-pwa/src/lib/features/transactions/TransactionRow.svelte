<script>
    import { formatAmount, formatDate, formatFinancial } from "$lib/utils";
    import { useSetting } from "$lib/domains/settings";
    import { TRANSACTION_TYPE_LABELS } from "$lib/constants/constants";

    export let tx;
    export let isEditing = false;
    export let editingTx;
    export let categories = [];

    export let onEdit;
    export let onSave;
    export let onCancel;
    export let onDelete;

    const sync = useSetting('sync');

    $: filteredCategories = editingTx?.transactionType 
        ? categories?.filter((c) => c.transactionType === editingTx?.transactionType) 
        : [];
</script>

<tr class={isEditing ? "editing" : ""}>
    <td>
        {#if isEditing}
            <input type="date" bind:value={editingTx.date} />
        {:else}
            {formatDate(tx.date)}
        {/if}
    </td>

    <td>
        {#if isEditing}
            <select bind:value={editingTx.transactionType}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
            </select>
        {:else}
            {TRANSACTION_TYPE_LABELS[tx.transactionType]}
        {/if}
    </td>

    <td>
        {#if isEditing}
            <input type="text" bind:value={editingTx.description} />
        {:else}
            {tx.description}
        {/if}
    </td>

    <td class="amount">
        {#if isEditing}
            <input type="number" step="0.01" bind:value={editingTx.amount} />
        {:else}
            <span class={tx.transactionType === "income" ? "amount-positive" : "amount-negative"}>
                {formatAmount(tx)}
            </span>
        {/if}
    </td>

    <td>
        {#if isEditing}
            <select bind:value={editingTx.categoryUuid}>
                {#each filteredCategories as cat}
                    <option value={cat.uuid}>{cat.name}</option>
                {/each}
            </select>
        {:else}
            {tx.category}
        {/if}
    </td>

    {#if $sync?.enabled}
    <td>{tx.synced ? "✅" : "☁️"}</td>
    {/if}

    <td class="actions">
        {#if isEditing}
            <button type="button" class="save" on:click={onSave}>Save</button>
            <button type="button" class="cancel" on:click={onCancel}>Cancel</button>
        {:else}
            <button class="edit" on:click={onEdit}>Edit</button>
            <button class="danger" on:click={onDelete}>Delete</button>
        {/if}
    </td>
</tr>

<style>
.amount-positive {
    color: var(--green-700);
}

.amount-negative {
    color: var(--red-700);
}

.actions {
    white-space: nowrap;
}

.actions button {
    border: none;
    background: none;
    padding: 0;
    margin-right: 0.5rem;

    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;

    transition: color 0.15s ease, opacity 0.15s ease;
}

.actions button:last-child {
    margin-right: 0;
}
</style>
