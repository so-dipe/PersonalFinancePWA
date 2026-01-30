<script>
    import { TRANSACTION_TYPE_LABELS } from "$lib/constants/constants";
    import { createEventDispatcher } from "svelte";

    export let categories = [];
    export let selectedUuids = [];

    let visible = false;

    const dispatch = createEventDispatcher();

    $: if (categories.length && selectedUuids.length === 0) {
        selectedUuids = categories.map(c => c.uuid);
    }

    $: grouped = {
        income: categories.filter(c => c.transactionType === 'income'),
        expense: categories.filter(c => c.transactionType === 'expense')
    };

    $: allSelected = selectedUuids.length === categories.length;

    function toggleSelectAll() {
        if (allSelected) {
            selectedUuids = [];
        } else {
            selectedUuids = categories.map(c => c.uuid);
        }
        dispatch("change", selectedUuids);
    }

    function toggleCategory(uuid) {
        if (selectedUuids.includes(uuid)) {
            selectedUuids = selectedUuids.filter(x => x !== uuid);
        } else {
            selectedUuids = [...selectedUuids, uuid];
        }
        dispatch("change", selectedUuids);
    }

    function toggleGroup(type) {
        const uuidsInGroup = grouped[type].map(c => c.uuid);
        const allInGroupSelected = uuidsInGroup.every(uuid => selectedUuids.includes(uuid));

        if (allInGroupSelected) {
            selectedUuids = selectedUuids.filter(u => !uuidsInGroup.includes(u));
        } else {
            selectedUuids = [...selectedUuids, ...uuidsInGroup];
        }
        dispatch("change", selectedUuids)
    }
</script>

<div class="category-wrapper">
    <button on:click={() => visible = !visible} class="toggle-button">
        Categories
        <span class="count">{selectedUuids.length}</span>
    </button>
    
    {#if visible}
    <div class="category-selector">
        <label class="select-all">
            <input 
                type="checkbox" 
                bind:checked={(allSelected)} 
                on:change={toggleSelectAll} 
            />
            Select all
        </label>
        {#each Object.entries(grouped) as [type, cats]}
        <div class="category-group">
            <label class="group-label">
                <input 
                    type="checkbox" 
                    checked={cats.every(c => selectedUuids.includes(c.uuid))} 
                    on:change={() => toggleGroup(type)} 
                />
                {TRANSACTION_TYPE_LABELS[type]}
            </label>
            {#each cats as cat}
            <label class="category-item">
                <input 
                    type="checkbox" 
                    checked={selectedUuids.includes(cat.uuid)} 
                    on:change={() => toggleCategory(cat.uuid)} 
                />
                {cat.name}
            </label>
            {/each}
        </div>
        {/each}
    </div>
    {/if}
</div>

<style>
.category-wrapper {
    position: relative;
}

.toggle-button {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-sm);
    border: 1px solid var(--gray-400);
    background-color: var(--surface-1);
    cursor: pointer;
}
.toggle-button:hover {
    background: var(--surface-2);
}

.toggle-button .count {
    font-size: 0.75rem;
    padding: var(--space-xs) var(--space-sm);
    border-radius: 999px;
    background-color: var(--green-200);
    color: var(--green-700);

}

.category-selector {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 20;

    background: var(--surface-1);
    border-radius: var(--radius-sm);
    padding: var(--space-md);
    box-shadow: var(--shadow-md);

    animation: pop 0.15s ease;
}

@keyframes pop {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.select-all {
    font-weight: bold;
    margin-bottom: var(--space-xs);
}

.category-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    margin-left: var(--space-xs);
    margin-bottom: var(--space-xs);
    width: 280px;
}

.group-label {
    font-size: 0.85rem;
    color: var(--gray-700);
}

.category-item {
    font-size: 0.85rem;
    padding-left: var(--space-sm);
}
</style>