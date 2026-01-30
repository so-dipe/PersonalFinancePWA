<script>
    import { notifications } from "$lib/stores/notification.store";
    import { fly, fade } from "svelte/transition";
</script>

<div class="notifications">
    {#each $notifications as n (n.id)}
        <div
            class="notification {n.severity}"
            in:fly={{ y: -20, duration: 200 }}
            out:fade={{ duration: 200 }}
        >
            <div class="content">
                {#if n.title}
                    <div class="title">{n.title}</div>
                {/if}


                <div class="message">{n.message}</div>


                {#if n.hint}
                    <div class="hint">{n.hint}</div>
                {/if}
            </div>


            <div class="actions">
                {#if n.action}
                    <button class="action-btn" on:click={n.action.handler}>
                        {n.action.label}
                    </button>
                {/if}


                {#if n.dismissible}
                    <button
                        class="dismiss-btn"
                        on:click={() =>
                            notifications.update(x => x.filter(i => i.id !== n.id))
                        }
                    >
                        &times;
                    </button>
                {/if}
            </div>
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
    gap: var(--space-sm);
}

.notification {
    display: flex;
    gap: var(--space-sm);
}


.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}


.title {
    font-weight: 700;
    font-size: 0.9rem;
}


.message {
    font-size: 0.85rem;
}


.hint {
    font-size: 0.75rem;
    opacity: 0.85;
}


/* map severity instead of type */
.notification.error {
    background: var(--red-500);
}


.notification.warning {
    background: var(--amber-700);
}


.notification.info {
    background: var(--gray-700);
}


.notification.success {
    background: var(--green-700);
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