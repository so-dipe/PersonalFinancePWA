<script>
    import { page } from "$app/stores";
</script>

<nav class="bottom-nav" aria-label="Primary">
    <a class:active={$page.url.pathname === "/"} href="/">
        <span class="icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
            </svg>
        </span>
        <span class="label">Overview</span>
    </a>
    <a class:active={$page.url.pathname.startsWith("/transactions")} href="/transactions">
        <span class="icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 7h14M5 12h10M5 17h7" />
            </svg>
        </span>
        <span class="label">Transactions</span>
    </a>
    <a class:active={$page.url.pathname.startsWith("/budgets")} href="/budgets">
        <span class="icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h16v12H4zM8 10h8M8 14h5" />
            </svg>
        </span>
        <span class="label">Budgets</span>
    </a>
    <a class:active={$page.url.pathname.startsWith("/insights")} href="/insights">
        <span class="icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 19h16M7 16V9m5 7V5m5 11v-4" />
            </svg>
        </span>
        <span class="label">Insights</span>
    </a>
    <a class:active={$page.url.pathname.startsWith("/account")} href="/account">
        <span class="icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 9a7 7 0 0 1 14 0" />
            </svg>
        </span>
        <span class="label">Account</span>
    </a>
</nav>

<style>
    .bottom-nav {
        position: fixed;
        left: 12px;
        right: 12px;
        bottom: calc(12px + env(safe-area-inset-bottom));
        z-index: 250;
        display: none;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
        padding: 10px;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid var(--gray-200);
        border-radius: 18px;
        box-shadow: var(--shadow-md);
        backdrop-filter: blur(10px);
    }

    .bottom-nav a {
        display: grid;
        place-items: center;
        gap: 4px;
        padding: 8px 4px;
        border-radius: 12px;
        color: var(--green-700);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.7rem;
        transition: background 0.2s ease, transform 0.2s ease;
    }

    .bottom-nav a:hover {
        background: var(--green-100);
        transform: translateY(-1px);
    }

    .bottom-nav a.active {
        background: var(--green-700);
        color: white;
    }

    .icon {
        width: 22px;
        height: 22px;
        display: grid;
        place-items: center;
    }

    .icon svg {
        width: 20px;
        height: 20px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    @media (max-width: 720px) {
        .bottom-nav {
            display: grid;
        }
    }
</style>
