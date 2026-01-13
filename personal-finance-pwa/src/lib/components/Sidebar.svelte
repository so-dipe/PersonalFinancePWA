<script>
    import { goto } from "$app/navigation";
</script>

<nav class="sidebar">
    <button on:click={() => goto('/')}>Transactions</button>
    <button disabled>Budget</button>
    <button disabled>Analytics</button>
</nav>