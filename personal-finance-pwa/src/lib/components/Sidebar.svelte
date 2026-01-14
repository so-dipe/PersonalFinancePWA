<script>
    import { goto } from "$app/navigation";
    export let open = false;

    function navigate(path) {
        goto(path);
        open = false;
    }
</script>


{#if open}
    <div class="sidebar-backdrop" on:click={() => open = false}></div>
{/if}


<aside class="sidebar" class:open={open}>
    <nav class="flex-col">
        <button on:click={() => navigate('/')}>TRANSACTIONS</button>
        <button on:click={() => navigate('/')}>BUDGET</button>
        <button on:click={() => navigate('/')}>ANALYTICS</button>
        <button on:click={() => navigate('/account')}>ACCOUNT</button>
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
        height: 100vh;
        width: 100vw;
        max-width: 100vw;


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
            width: 50vw;
            max-width: 50vw;
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


    nav button:hover {
        color: var(--green-700);
    }


    nav button.active {
        color: var(--green-900);
    }
</style>
