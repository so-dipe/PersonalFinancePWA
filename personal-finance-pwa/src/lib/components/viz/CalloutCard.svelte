<script>
    export let label = "";
    export let value = "";
    export let icon = "";
    export let color = "blue";
    export let subtitle = "";
</script>

<div class="stat-card {color}">
    {#if icon}
        <div class="icon">{icon}</div>
    {/if}
    <div class="content">
        <div class="label text-muted">{label}</div>
        <div class="value">{value}</div>
        {#if subtitle}
            <div class="subtitle">{subtitle}</div>
        {/if}
    </div>
</div>

<style>
.stat-card {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-md);
    border-radius: var(--border-radius);
    background-color: var(--gray-100);
    box-shadow: var(--shadow-md);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
    transform: scale(1.01);
    box-shadow: var(--shadow-lg);
}

.icon {
    font-size: 1.5rem;
    color: var(--gray-500);
}

.content {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
}

.label {
    font-size: 0.75rem;
}

.value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--gray-900);
}

.subtitle {
    font-size: 0.75rem;
    color: var(--gray-500);
}

.blue { color: #3b82f6; background-color: #eff6ff }
.green { color: #10b981; background-color: #ecfdf5 }
.yellow { color: #f59e0b; background-color: #fffbeb }
.red { color: #ef4444; background-color: #fef2f2 }
</style>