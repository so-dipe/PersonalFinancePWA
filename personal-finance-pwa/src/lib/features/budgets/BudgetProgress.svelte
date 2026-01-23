<script>
    export let percent = 0;
    export let type = "expense";

    $: cappedWidth = Math.min(Math.max(percent, 0), 100);

    $: isExpense = type === "expense";
    $: isIncome = type === "income";

    $: status =
        isExpense && percent >= 100 ? "danger"
        : isExpense && percent >= 80 ? "warning"
        : isIncome && percent >= 100 ? "success"
        : "normal";
</script>

<div class="budget-progress {type}">
    <div class="progress-track">
        <div
            class="progress-fill {status}"
            style="width: {cappedWidth}%"
        ></div>
    </div>

    <div class="progress-label">
        {#if isExpense}
            {percent}% of budget used
        {:else}
            {percent}% of target earned
        {/if}
    </div>
</div>

<style>
.budget-progress {
    margin-top: var(--space-sm);
}

.progress-track {
    width: 100%;
    height: 16px;
    background: var(--bg-muted);
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    transition: width 0.3s ease, background 0.3s ease;
}

/* ---- expense semantics ---- */
.progress-fill.normal {
    background: var(--green-500);
}

.progress-fill.warning {
    background: var(--yellow-500);
}

.progress-fill.danger {
    background: var(--red-500);
}

/* ---- income semantics ---- */
.budget-progress.income .progress-fill {
    background: var(--blue-500);
}

.budget-progress.income .progress-fill.success {
    background: var(--green-700);
}

.progress-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: var(--space-xs);
}
</style>
