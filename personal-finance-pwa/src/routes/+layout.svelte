<script>
	import "../app.css";
	import Sidebar from '$lib/components/Sidebar.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<div class="app">
	<!-- <Sidebar /> -->
	{@render children()}
</div>


