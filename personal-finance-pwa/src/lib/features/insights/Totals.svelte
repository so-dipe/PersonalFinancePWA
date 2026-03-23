<script>
    import CalloutCard from "$lib/components/viz/CalloutCard.svelte";
    import { formatFinancial } from "$lib/utils";

    export let totalIncome;
    export let totalExpense;

</script>

<div class="main-stats">
    <div class="stat-card">
        <CalloutCard 
            label="Total Income" 
            value={formatFinancial(totalIncome ?? "")} 
            icon=""
            color="green"
        />
    </div>
    <div class="stat-card">
        <CalloutCard 
            label="Total Expenses" 
            value={formatFinancial(totalExpense ?? "")} 
            icon=""
            color="red"
        />
    </div>
</div>

<style>
.main-stats {
    display: flex;
    gap: var(--space-md);
    flex-wrap: nowrap;
}

.stat-card {
    flex: 1 1 0;
    min-width: 0;
}

@media (max-width: 600px) {
    .main-stats {
        gap: var(--space-sm);
    }

    :global(.main-stats .label) {
        font-size: 0.7rem;
    }

    :global(.main-stats .value) {
        font-size: 1.25rem;
    }
}

</style>
