<script>
    import { notifications } from "$lib/notification/store";
    import { fly, fade } from "svelte/transition";
</script>

<div class="notifications">
    {#each $notifications as n (n.id)}
    <div class="notification {n.type}" in:fly={{ y:-20, duration:200 }} out:fade={{ duration: 200 }}>
        <span>{n.message}</span>
        {#if n.action}
            <button on:click={n.action.handler}>
                {n.action.label}
            </button>
        {/if}
        {#if n.dismissible}
            <button class="dismiss-btn" on:click={() => {notifications.update(x => x.filter(i => i.id !== n.id))}}>
                &times;
            </button>
        {/if}
    </div>
    {/each}
</div>

<style>
.notifications {
    position: fixed;
    top: var(--space-lg);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    z-index: 9999;
    pointer-events: none;
}

.notification {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 300px;
    max-width: 450px;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-sm);
    color: white;
    font-weight: 500;
    box-shadow: var(--shadow-md);
    pointer-events: auto;
    position: relative;
    overflow: hidden;
}

.notification.success {
    background: var(--green-700);
}

.notification.error {
    background: var(--red-500);
}

.notification.info {
    background: var(--gray-700)
}

.notification.warning {
    background: orange;
}

.dismiss-btn {
    background: transparent;
    border: none;
    color: white;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    margin-left: var(--space-xs);
}

.action-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-weight: bold;
    border-radius: var(--radius-sm);
    padding: 0.25rem 0.25rem;
    margin-left: var(--space-xs);
    cursor: pointer;
}

.action-btn:hover {
    background: rgba(225, 255, 255, 0.3);
}
</style>