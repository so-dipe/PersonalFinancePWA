<script>
    import { db, loadDefaultCategories } from "$lib/db";
    import Accordion from "./Accordion.svelte";

    let categories = [];

    db.categories.where('deleted').equals(0).toArray().then((cats) => {
        if (cats.length === 0) {
            loadDefaultCategories(async () => {
                categories = await db.categories.toArray();
            })
        } else {
            categories = cats
        }
    })
</script>

<Accordion title="Manage Categories">
    {#each categories as cat}
        <div>
            {cat.name} - {cat.transactionType}
        </div>
    {/each}
</Accordion>