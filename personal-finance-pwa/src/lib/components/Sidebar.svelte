<script>
    import { goto } from "$app/navigation";
    import { createEventDispatcher } from "svelte";
    
    export let open = false;
    const dispatch = createEventDispatcher();

    async function navigate(path, disabled = false) {
        if (disabled) return;

        try {
            await goto(path);
            dispatch("close");
        } catch (err) {
            console.error(err);
            dispatch("error", { message: `Failed to navigate to ${path}` });
        }
    }

    function closeSidebar() {
        dispatch("close");
    }
</script>


{#if open}
    <div class="sidebar-backdrop" on:click={closeSidebar}></div>
{/if}


<aside class="sidebar" class:open={open}>
    <nav class="flex-col">
        <button on:click={() => navigate('/')}>add</button>
        <button on:click={() => navigate('/transactions')}>transactions</button>
        <button on:click={() => navigate('/budgets')}>budgets</button>
        <button on:click={() => navigate('/insights')}>insights</button>
        <button on:click={() => navigate('/account')}>account</button>
    </nav>
</aside>


<style>
    .sidebar-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 199;
    }


    .sidebar {
        position: fixed;
        top: 0;
        right: 0;
        height: 100%;
        width: 100%;
        max-width: 100%;


        background: var(--bg-card);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 200;
        padding: var(--space-lg);

        display: flex;
        align-items: flex-start;
        padding-top: 30vh;
    }


    /* Desktop width */
    @media(min-width: 768px) {
        .sidebar {
            width: 50%;
            max-width: 50%;
        }
    }


    /* Open state */
    .sidebar.open {
        transform: translateX(0);
    }

    nav button {
        background: none;
        border: none;
        padding: var(--space-sx) 0;
        font-size: 4rem;
        font-weight: 900;
        color: var(--green-900);
        text-align: left;
        cursor: pointer;
    }


    nav button:hover:not(:disabled) {
        color: var(--green-700);
    }

    nav button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }


    /* nav button.active {
        color: var(--green-900);
    } */
</style>
