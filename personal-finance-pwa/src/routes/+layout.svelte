<script>
    import "../app.css";
    import Sidebar from '$lib/components/Sidebar.svelte';
    import BottomNav from "$lib/components/BottomNav.svelte";
    import ProfileMenu from "$lib/components/ProfileMenu.svelte";
    import Notifications from "$lib/components/Notifications.svelte";
    import { useSetting } from "$lib/domains/settings";
    import { browser } from "$app/environment";


    let sidebarOpen = false;
    let scrolled = false;
    const displaySetting = useSetting("display");

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }

    function closeSidebar() {
        sidebarOpen = false;
    }

    $: if (browser) {
        const darkMode = $displaySetting?.darkMode;
        if (darkMode) {
            document.documentElement.dataset.theme = "dark";
        } else {
            delete document.documentElement.dataset.theme;
        }
    }
</script>


<svelte:head>
    <link rel="icon" href="/k.svg" type="image/svg+xml"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <meta name="description" content="A personal finance app." />
    <title>kobo</title>
</svelte:head>


<div class="app">
    <!-- <header class="app-header">
        <div class="center">
            <span class="app-logo">kobo</span>
        </div>
    </header> -->
    <Notifications />
    <ProfileMenu bind:sidebarOpen={sidebarOpen} />
    <Sidebar open={sidebarOpen} on:close={closeSidebar} />
    <BottomNav />

    <div class="app-shell">
        <slot />
    </div>
</div>

<style>




</style>
