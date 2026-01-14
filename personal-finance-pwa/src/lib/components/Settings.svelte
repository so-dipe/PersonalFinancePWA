<script>
    import ManageCategories from './ManageCategories.svelte';
    let autoSync = false;
    let darkMode = false;
</script>


<div class="settings">
    <ManageCategories />


    <div class="setting-item">
        <label>
            <input type="checkbox" bind:checked={autoSync}>
            Automatically sync
        </label>
    </div>


    <div class="setting-item">
        <label>
            <input type="checkbox" bind:checked={darkMode}>
            Dark Mode
        </label>
    </div>
</div>


<style>
.settings {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 2rem;
}


.setting-item label {
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
}
</style>
