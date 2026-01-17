<script>
    import { db, loadDefaultCategories } from "$lib/db";
    import SettingsAccordion from "./SettingsAccordion.svelte";
    import { onMount } from "svelte";
    import { notify } from "$lib/notification/store";

    let categories = [];
    let editingId = null;
    let editName = '';
    let editType = '';

    let newName = '';
    let newType = 'Expense';

    async function loadCategories() {
        try {
            let cats = await db.categories.where('deleted').equals(0).toArray();
            if (cats.length === 0) {
                await loadDefaultCategories();
                cats = await db.categories.where('deleted').equals(0).toArray();
            }
            categories = cats;
        } catch (err) {
            console.error("Failed to load categories:", err);
            notify({ type: "error", message: "Failed to load categories" });
        }
    }

    onMount(loadCategories);

    async function addCategory() {
        if (!newName.trim()) return;
        try {
            await db.categories.add({
                uuid: crypto.randomUUID(),
                name: newName.trim(),
                transactionType: newType,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                deleted: 0,
                synced: 0
            });
            notify({ type: "success", message: `Category "${newName}" added`  });
            newName = '';
            newType = 'Expense';
            await loadCategories();
        } catch (err) {
            console.error("Failed to add category:", err);
            notify({ type: "error", message: "Failed to add category"  });
        }
    }

    function startEdit(cat) {
        editingId = cat.id;
        editName = cat.name;
        editType = cat.transactionType;
    }

    async function saveEdit(cat) {
        if (!editName.trim()) return; // prevent blank name
        try {
            await db.categories.update(cat.id, {
                name: editName.trim(),
                transactionType: editType,
                modifiedAt: new Date().toISOString(),
                synced: 0
            });
            notify({ type: "success", message: `Category "${editName}" updated` });
            editingId = null;
            await loadCategories();
        } catch (err) {
            notify({ type: "error", message: "Failed to update category"  });
        }
    }

    function cancelEdit() {
        editingId = null;
    }

    async function deleteCategory(cat) {
        if (!confirm(`Delete "${cat.name}"?`)) return;
        try {
            await db.categories.update(cat.id, {
                deleted: 1,
                modifiedAt: new Date().toISOString(),
                synced: 0
            });
            categories = categories.filter(c => c.id !== cat.id);
            notify({ type: "success", message: `Category "${cat.name}" deleted` });
        } catch (err) {
            notify({ type: "error", message: "Failed to delete category" });
        }
    }
</script>

<SettingsAccordion title="Manage Categories">
    <div class="add-row">
        <input 
            type="text"
            placeholder="New Category name"
            bind:value={newName}
            on:keydown={(e) => e.key === 'Enter' && addCategory()}
        />
        <select bind:value={newType}>
            <option>Income</option>
            <option>Expense</option>
        </select>

        <button class="add-btn" on:click={addCategory}>Add</button>
    </div>

    {#if categories.length === 0}
        <p class="text-muted">No categories available.</p>
    {/if}

    {#each categories as cat}
        <div class="category-row">
            {#if editingId === cat.id}
                <input 
                    type="text"
                    class="edit-input" 
                    bind:value={editName} 
                    on:keydown={(e) => e.key === 'Enter' && saveEdit(cat)}
                    on:keydown={(e) => e.key === 'Escape' && cancelEdit()}
                />
                <select bind:value={editType}>
                    <option>Income</option>
                    <option>Expense</option>
                </select>
                <div class="actions">
                    <button class="save" on:click={() => saveEdit(cat)}>Save</button>
                    <button class="cancel" on:click={cancelEdit}>Cancel</button>
                </div>
            {:else}
                <div class="info">
                    <strong>{cat.name}</strong>
                    <span 
                        class="badge" 
                        class:income={cat.transactionType === 'Income'} 
                        class:expense={cat.transactionType === 'Expense'}
                    >
                        {cat.transactionType}
                    </span>
                </div>
                <div class="actions">
                    <button on:click={() => startEdit(cat)}>Edit</button>
                    <button class="danger" on:click={() => deleteCategory(cat)}>Delete</button>
                </div>
            {/if}
        </div>
    {/each}
</SettingsAccordion>


<style>
.add-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
}

.add-btn {
    background: var(--green-900);
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
    cursor: pointer;
}

.category-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) 0;
}

.info {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.badge {
    background: var(--gray-200);
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.8rem;
}

.badge.income {
    background: var(--green-200);
    color: var(--green-900);
}

.badge.expense {
    background: var(--red-100);
    color: var(--red-700);
}

.edit-input {
    min-width: 160px;
    width: 100%;
}

.actions {
    display: flex;
    gap: var(--space-sm);
}

.actions button {
    border: none;
    background: none;
    font-weight: 600;
    cursor: pointer;
}

.actions .save {
    color: var(--green-800);
}

.actions .cancel {
    color: var(--gray-600);
}

.actions .danger {
    color: var(--red-700);
}
</style>