<script>
    import { goto } from "$app/navigation";
    import { createEventDispatcher } from "svelte";
    import { page } from "$app/stores";
    
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

    function isActive(path) {
        const current = $page?.url?.pathname ?? "/";
        if (path === "/") {
            return current === "/";
        }
        return current === path || current.startsWith(`${path}/`) || current.startsWith(path);
    }
</script>





<aside class="sidebar" class:open={open}>
    <div class="sidebar-top">
        <div class="sidebar-header">
            <div class="brand-mark">k</div>
            <div>
                <p class="brand-title">kobo</p>
                
            </div>
        </div>
    </div>
    <nav class="flex-col">
        <button class:active={isActive('/')} on:click={() => navigate('/')}>
            <span class="icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
                </svg>
            </span>
            <span class="label">Overview</span>
        </button>
        <button class:active={isActive('/transactions')} on:click={() => navigate('/transactions')}>
            <span class="icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 7h14M5 12h10M5 17h7" />
                </svg>
            </span>
            <span class="label">Transactions</span>
        </button>
        <button class:active={isActive('/budgets')} on:click={() => navigate('/budgets')}>
            <span class="icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 6h16v12H4zM8 10h8M8 14h5" />
                </svg>
            </span>
            <span class="label">Budgets</span>
        </button>
        <button class:active={isActive('/insights')} on:click={() => navigate('/insights')}>
            <span class="icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 19h16M7 16V9m5 7V5m5 11v-4" />
                </svg>
            </span>
            <span class="label">Insights</span>
        </button>
        <button class:active={isActive('/account')} on:click={() => navigate('/account')}>
            <span class="icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 9a7 7 0 0 1 14 0" />
                </svg>
            </span>
            <span class="label">Account</span>
        </button>
    </nav>
</aside>


<style>
 


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
        padding: clamp(20px, 4vw, 36px);

        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-xl);
        padding-top: 12vh;
    }

    .sidebar-top {
        width: 100%;
    }


    /* Desktop width */
    @media(min-width: 720px) {
        .sidebar {
            width: 40%;
            max-width: 480px;
        }
    }

    @media (min-width: 1024px) {
 

        .sidebar {
            left: 0;
            right: auto;
            width: 260px;
            max-width: 260px;
            transform: translateX(0);
            padding-top: 8vh;
            box-shadow: var(--shadow-md);
            border-right: 1px solid var(--gray-200);
        }

        .sidebar.open {
            transform: translateX(0);
        }
    }


    /* Open state */
    .sidebar.open {
        transform: translateX(0);
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-md);
        border-radius: var(--radius-lg);
        background: var(--surface-2);
        border: 1px solid var(--gray-200);
        width: 100%;
    }

    .brand-mark {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 1.1rem;
        color: white;
        background: linear-gradient(135deg, var(--green-700), var(--green-500));
        box-shadow: 0 10px 18px rgba(31, 122, 79, 0.28);
    }

    .brand-title {
        font-weight: 700;
        margin: 0;
        font-size: 1.05rem;
    }



    nav {
        width: 100%;
        gap: var(--space-sm);
    }

    nav button {
        width: 100%;
        background: var(--surface-2);
        border: 1px solid transparent;
        padding: 0.9rem 1rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--green-900);
        text-align: left;
        cursor: pointer;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: 0.85rem;
        transition: transform 0.2s ease, border-color 0.2s ease,
            background 0.2s ease;
    }

    nav button:hover:not(:disabled) {
        background: var(--green-100);
        border-color: var(--green-500);
        transform: translateX(4px);
    }

    nav button.active {
        background: var(--green-100);
        border-color: var(--green-500);
    }

    nav button.active .icon {
        background: var(--green-700);
        border-color: var(--green-700);
        color: white;
    }

    nav button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    .icon {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        background: white;
        border: 1px solid var(--gray-200);
        display: grid;
        place-items: center;
        color: var(--green-700);
    }

    .icon svg {
        width: 18px;
        height: 18px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .label {
        letter-spacing: -0.01em;
    }

    @media (max-width: 720px) {
        .sidebar {
            padding-top: 16vh;
        }

        .sidebar-header {
            border-radius: 18px;
        }
    }
</style>
