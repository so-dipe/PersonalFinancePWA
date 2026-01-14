<script>
    import "../app.css";
    import Sidebar from '$lib/components/Sidebar.svelte';
    import ProfileMenu from "$lib/components/ProfileMenu.svelte";


    let sidebarOpen = false;
    // let { children } = $props();
</script>


<svelte:head>
    <link rel="icon" href="/favicon.svg" />
</svelte:head>


<div class="app">
    <ProfileMenu bind:sidebarOpen={sidebarOpen} />
    <Sidebar bind:open={sidebarOpen} />

	<slot />

    <!-- {@render children()} -->
</div>
