<script>
    import "../app.css";
    import Sidebar from '$lib/components/Sidebar.svelte';
    import ProfileMenu from "$lib/components/ProfileMenu.svelte";
    import Notifications from "$lib/components/Notifications.svelte";


    let sidebarOpen = false;
    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }

    function closeSidebar() {
        sidebarOpen = false;
    }
    // let { children } = $props();
</script>


<svelte:head>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <meta name="description" content="A personal finance app." />
</svelte:head>


<div class="app">
    <Notifications />
    <ProfileMenu bind:sidebarOpen={sidebarOpen} />
    <Sidebar open={sidebarOpen} on:close={closeSidebar} />

	<slot />
</div>

<style>
.app {
    min-height: 100vh;
    background: var(--bg-main);
}
</style>
