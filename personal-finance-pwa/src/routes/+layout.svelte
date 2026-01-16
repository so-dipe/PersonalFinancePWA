<script>
    import "../app.css";
    import Sidebar from '$lib/components/Sidebar.svelte';
    import ProfileMenu from "$lib/components/ProfileMenu.svelte";
    import Notifications from "$lib/components/Notifications.svelte";


    let sidebarOpen = false;
    // let { children } = $props();
</script>


<svelte:head>
    <link rel="icon" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <meta name="description" content="A personal finance app." />
</svelte:head>


<div class="app">
    <Notifications />
    <ProfileMenu bind:sidebarOpen={sidebarOpen} />
    <Sidebar bind:open={sidebarOpen} />

	<slot />
</div>

<style>
.app {
    min-height: 100vh;
    background: var(--bg-main);
}
</style>
