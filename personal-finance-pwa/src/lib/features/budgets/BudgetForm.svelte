<script>
    import { BUDGET_PERIODS } from "$lib/constants/constants";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let draft;
    export let categories = [];
    export let start = "";
    export let end = "";

    function submit() {
        dispatch("save", draft);
    }

    function cancel() {
        dispatch("cancel");
    }
</script>

<form class="form-grid" on:submit|preventDefault={submit}>
    <label>
        Category
        <select bind:value={draft.categoryUuid} required>
            <option value="" disabled>Select category</option>
            {#each categories as cat}
                <option value={cat.uuid}>{cat.name}</option>
            {/each}
        </select>
    </label>

    <label>
        Period
        <select bind:value={draft.periodUnit} required>
            {#each Object.entries(BUDGET_PERIODS) as [period, periodName]}
                <option value={period}>{periodName}</option>
            {/each}
        </select>
    </label>

    <label>
        Period Count
        <input
            type="number"
            bind:value={draft.periodCount}
            min="1"
            max="10"
            step="1"
            required
        />
    </label>

    <label>
        Amount
        <input
            type="number"
            bind:value={draft.amount}
            min="0.01"
            step="0.01"
            required
        />
    </label>

    <label>
        Start Date
        <input type="date" bind:value={draft.startDate} required />
    </label>

    <label>
        Description
        <input type="text" bind:value={draft.description} placeholder="Optional" />
    </label>

    <div class="period-preview text-muted">
        Budget Period: {start} ➡️ {end}
    </div>

    <div class="actions">
        <button type="submit" class="primary">Save</button>
        <button type="button" class="cancel" on:click={cancel}>Cancel</button>
    </div>
</form>

<style>
.form-grid {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
}

@media (max-width: 600px) {
    .form-grid {
        grid-template-columns: 1fr;
    }
}

.form-grid label {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
    gap: var(--space-xs);
}

input, select {
    padding: 0.5rem;
    border: 1px solid var(--bg-muted);
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus, select:focus {
    outline: none;
    border-color: var(--green-500);
    box-shadow: 0 0 0 2px var(--green-200);
}

input:invalid,
select:invalid {
    border-color: var(--red-500);
}

.period-preview {
    grid-column: span 2;
    font-size: 0.8rem;
    color: var(--text-muted);
}

.actions {
    display: flex;
    gap: var(--space-sm);
    grid-column: span 2;
}

.actions button {
    flex: 1;
    min-width: 100px;
}

button.primary {
    background: var(--green-700);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.75rem;
    font-weight: 600;
    transition: background 0.2s ease;
}

button.primary:hover {
    background: var(--green-900);
}

button.cancel {
    background: none;
    border: none;
    color: var(--text-muted);
    font-weight: 500;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.2s ease;
}

button.cancel:hover {
    color: var(--green-700);
}
</style>
