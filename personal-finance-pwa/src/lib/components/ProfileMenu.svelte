<script>
    import { goto } from "$app/navigation";
    import { useSetting } from "$lib/domains/settings";
    import { notify } from "$lib/stores/notification.store";
    export let sidebarOpen = false;

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }

    async function goToAccount() {
        try {
            await goto('/account');
        } catch (err) {
            console.error(err);
            notify({ type: "error", message: "Failed to navigate to Account page." });
        }
    }

    const account = useSetting('account');
</script>


<div class="nav card">
    <div class="nav-cluster">
        <button class="profile-btn floating-btn" on:click={() => goto('/account')} aria-label="Account">
            <img 
                src={$account?.picture || '/avatar.png'} 
                alt={$account?.name ? `${$account.name} Profile` : 'Profile'} 
                class="avatar"
            >
        </button>
    </div>

    <div class="nav-cluster">
        <button class="hamburger floating-btn" class:open={sidebarOpen} on:click={toggleSidebar} aria-label="Toggle Sidebar">
            <span class="bar top"></span>
            <span class="bar middle"></span>
            <span class="bar bottom"></span>
        </button>
    </div>
</div>


<style>
    .nav {
        position: fixed;
        top: var(--space-md);
        right: var(--space-md);
        z-index: 300;


        display: flex;
        align-items: center;
        gap: var(--space-md);


        padding: 0.4rem 0.6rem;
        background: var(--bg-card);
        border-radius: 999px;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--gray-200);
        backdrop-filter: blur(10px);
    }

    .nav-cluster {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }


    .profile-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        background: none;
        border: none;
        cursor: pointer;
    }


    .profile-btn img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
    }


    .hamburger {
        width: 36px;
        height: 36px;
        padding: 0;
        background: none;
        border: none;
        cursor: pointer;


        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
    }


    /* Hamburger bars */
    .bar {
        width: 28px;
        height: 5px;
        background: var(--green-900);
        border-radius: 2px;
        transition: transform 0.25s ease, opacity 0.2s ease;
    }


    /* Open state */
    .hamburger.open .top {
        transform: translateY(7px) rotate(45deg);
    }
    .hamburger.open .middle {
        opacity: 0;
    }
    .hamburger.open .bottom {
        transform: translateY(-11px) rotate(-45deg);
    }

    .floating-btn {
        border-radius: 999px;
        background: white;
        border: 1px solid var(--gray-200);
        box-shadow: var(--shadow-sm);
    }

    @media (min-width: 721px) {
        .profile-btn,.nav,
        .hamburger {
            display: none;
        }
    }

    @media (max-width: 720px) {
        .nav {
            display: none;
        }

        .nav {
            top: auto;
            right: 16px;
            bottom: 20px;
            flex-direction: column;
            gap: 10px;
            padding: 0;
            background: transparent;
            border: none;
            box-shadow: none;
        }

        .floating-btn {
            width: 52px;
            height: 52px;
            box-shadow: 0 16px 32px rgba(17, 24, 39, 0.16);
        }

        .hamburger .bar {
            width: 26px;
            height: 4px;
        }
    }
</style>
