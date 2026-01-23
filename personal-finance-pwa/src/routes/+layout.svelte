<script>
    import "../app.css";
    import Sidebar from '$lib/components/Sidebar.svelte';
    import ProfileMenu from "$lib/components/ProfileMenu.svelte";
    import Notifications from "$lib/components/Notifications.svelte";
    import { onMount } from "svelte";


    let sidebarOpen = false;
    let scrolled = false;

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }

    function closeSidebar() {
        sidebarOpen = false;
    }
    
    onMount(() => {
            const onScroll = () => {
                window.scrollY > 40;
            };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    });
</script>


<svelte:head>
    <link rel="icon" href="/k.svg" type="image/svg+xml"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <meta name="description" content="A personal finance app." />
    <title>kobo</title>
</svelte:head>


<div class="app">
    <header class="app-header {scrolled ? 'scrolled' : ''}">
        <a href="/" class="logo">kobo</a>
    </header>
    <Notifications />
    <ProfileMenu bind:sidebarOpen={sidebarOpen} />
    <Sidebar open={sidebarOpen} on:close={closeSidebar} />

	<slot />
</div>

<style>
.app-header {
    position: sticky;
    top: 12px;
    z-index: 10;

    display: flex;
    justify-content: center;
    
    pointer-events: none;
}

.logo {
    pointer-events: auto;

    display: inline-flex;
    align-items: center;

    padding: 10px 18px;

    border-radius: 999px;

    font-size: 2rem;
    font-weight: 900;
    text-decoration: none;
    color: inherit;

    background: var(--bg-main);
    box-shadow: var(--shadow-sm);

    transition:
        font-size 200ms ease,
        padding 200ms ease,
        transform 200ms ease,
        box-shadow 200ms ease;
}


/* Scrolled state */
.app-header.scrolled {
    height: 48px;
    padding: 0 var(--space-md);
    justify-content: flex-start;
    box-shadow: 0 6px 20px rgba(0,0,0,0.12);
}


.app-header.scrolled .logo {
    font-size: 1.1rem;
    transform: translateX(12px);
}
</style>
