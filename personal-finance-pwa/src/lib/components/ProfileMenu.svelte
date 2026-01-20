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
    <button class="profile-btn" on:click={() => goto('/account')} aria-label="Account">
        <img 
            src={$account?.picture || '/avatar.png'} 
            alt={$account?.name ? `${$account.name} Profile` : 'Profile'} 
            class="avatar"
        >
    </button>

    <button class="hamburger" class:open={sidebarOpen} on:click={toggleSidebar} aria-label="Toggle Sidebar">
        <span class="bar top"></span>
        <span class="bar middle"></span>
        <span class="bar bottom"></span>
    </button>
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


        padding: var(--space-sm);
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
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
</style>
