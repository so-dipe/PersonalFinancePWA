<script>
    import { addTransactionBulk } from '$lib/domains/transactions';
    import { runImportPipeline } from '$lib/features/import/pipeline';
    import { normalizeToISODate } from '$lib/utils';
    import * as XLSX from 'xlsx';
    import ImportDialog from './ImportDialog.svelte';
    import { notify } from '$lib/stores/notification.store';
    import { onMount, tick } from 'svelte';
    import { getActiveCategories, getOrCreateCategory } from '$lib/domains/categories';
    import Papa from 'papaparse';
    import { Import } from 'lucide-svelte';
    import { errorToNotification } from '$lib/stores/notification.mapper';

    let file;
    let transactions = [];
    let hasHeader = false;
    
    let showDialog = false;
    let loading = false;
    let showModal = false;
    let dialog;

    let categoryMap = {};

    onMount(async () => {
        const cats = await getActiveCategories();
        categoryMap = Object.fromEntries(cats.map(c => [c.name.toLowerCase(), c.uuid]));
    })

    function handleFileChange(event) {
        file = event.target.files[0];
    }

    function isCSV(file) {
        return file.name.toLowerCase().endsWith('.csv');
    }

    function normalizeCategory(raw) {
        if (!raw) return null;

        return raw
            .toString()
            .trim()
            .toLowerCase()
    }

    function resolveCategories(transactions, categoryMap) {
        const newCategories = new Map();

        const resolved = transactions.map(tx => {
            if (!tx.rawCategory) {
                return {...tx, categoryUuid: null };
            }

            const existing = categoryMap[tx.rawCategory];
            if (existing) {
                return {...tx, categoryUuid: existing };
            }

            if (!newCategories.has(tx.rawCategory)) {
                newCategories.set(tx.rawCategory, crypto.randomUUID());
            }

            return {
                ...tx,
                categoryUuid: newCategories.get(tx.rawCategory),
                _isNewCategory: true
            };
        });
        return {
            transactions: resolved,
            newCategories: [...newCategories.keys()]
        }
    }

    async function processRows(rows) {
        const raw = rows
            .filter(r => r.length >= 4)
            .map(r => ({
                    date: normalizeToISODate(r[0]),
                    transactionType: (r[1] ?? 'expense')
                        .toString()
                        .trim()
                        .toLowerCase(),
                    description: r[2] || '',
                    amount: r[3] ?? 0,
                    rawCategory: normalizeCategory(r[4]),
                    source: 'csv/excel'
                }));

        transactions = await runImportPipeline(raw);
        showDialog = true;
    }



    function importFile() {
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                loading = true;

                let rows = [];

                if (isCSV(file)) {
                    const text = e.target.result;
                    const clean = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim();
                    const parsed = Papa.parse(clean, {
                        skipEmptyLines: true,
                        dynamicTyping: true,
                        error: (e) => console.warn("Papa parse error", e)
                    });
                    if (parsed.errors.length) {
                        console.warn("CSV parsing issues: ", parsed.errors);
                        rows = Papa.parse(clean, {
                            skipEmptyLines: true,
                            relaxColumnCount: true
                        }).data;
                    } else {
                        rows = parsed.data;
                    }
                } else {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                }

                if (!rows.length || rows.every(r => r.length === 0)) {
                    notify({ type: "error", message: "No rows detected."})
                    return;
                } else if (hasHeader && rows.length === 1) {
                    notify({ type: "error", message: "File only contains a header row."});
                    return;
                }

                rows = hasHeader ? rows.slice(1) : rows;

                if (!rows.length) throw new Error("No data found");

                await processRows(rows);
            } catch (e) {
                console.error(e);
                notify({ type: "error", message: `Import failed: ${e}` });
            } finally {
                loading = false;
            }
        };

        reader.onerror = () => (loading = false);

        if (isCSV(file)) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    }

    async function commitImport() {
        try {
            const ready = transactions.filter(tx => tx.status === "ready")

            if (!ready.length) return;

            for (const tx of ready) {
                if (!tx.rawCategory) continue;
                const { uuid } = await getOrCreateCategory(tx.rawCategory, tx.transactionType);
                tx.categoryUuid = uuid;
            }

            await addTransactionBulk(ready);

            notify({ type: "success", message: `${ready.length} transactions imported.`})
            showDialog = false;
            transactions = []
        } catch (e) {
            console.error(e);
            notify(errorToNotification(e));
        }
    }

    async function openModal() {
        showModal = true;
        await tick();
        if (dialog && !dialog.open) dialog.showModal();
    }

    function closeModal() {
        showModal = false;
        if (dialog) dialog.close();
    }
</script>

<button class="import-trigger" type="button" on:click={openModal}>
    <span class="accordion-title">
        <span class="icon" aria-hidden="true">
            <Import class="icon" />
        </span>
        Import from CSV/Excel
    </span>
    <span class="chevron">▾</span>
</button>

{#if showModal}
    <dialog
        class="import-modal"
        bind:this={dialog}
        on:close={() => (showModal = false)}
        on:keydown={(e) => {
            if (e.key === "Escape") closeModal();
        }}
    >
        <div class="modal-head">
            <h3>Import from CSV/Excel</h3>
            <button class="icon-btn" type="button" on:click={closeModal} aria-label="Close">
                X
            </button>
        </div>
        <div class="modal-body">
            <div class="import-instructions">
                <h4>Before importing your file</h4>
                <ul>
                    <li>Ensure your data is in the <strong>first sheet</strong> of the file</li>
                    <li>Columns must be in this order:</li>
                    <li class="format">
                        Date | Transaction Type | Description | Amount | Category
                    </li>
                    <li>Check "First row is header" if applicable</li>
                </ul>
            </div>
            <div class="upload-form">
                <label class="file-input">
                    <input type="file" accept=".csv, .xlsx, .xls" on:change={handleFileChange} disabled={loading} />
                </label>
                <label class="checkbox" for="hasHeader">
                    <input type="checkbox" id="hasHeader" bind:checked={hasHeader} disabled={!file}/>
                    <span>First row is header</span>
                </label>
            </div>
        </div>
        <div class="modal-actions">
            <button class="ghost" type="button" on:click={closeModal}>Cancel</button>
            <button class="primary" type="button" on:click={importFile} disabled={loading}>
                {loading ? "Loading..." : "Load Transactions"}
            </button>
        </div>
    </dialog>
{/if}
{#if showDialog}
    <ImportDialog
        {transactions}
        onClose={() => (showDialog = false)}
        onCommit={commitImport}
    />
{/if}

<style>

   .accordion-title {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
}



.icon {
  width: 22px;
  height: 22px;
  
  display: grid;
  place-items: center;
  color: var(--green-700);
}
    .import-instructions {
        background: var(--bg-main);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-sm);
        padding: var(--space-md);
        font-size: 0.9rem;
    }
    
    .import-instructions h4 {
        margin: 0 0 var(--space-xs);
        font-weight: 600;
    }
    
    .import-instructions ul {
        margin: 0;
        padding-left: 1rem;
    }
    
    .import-instructions li {
        margin-bottom: 0.35rem;
    }
    
    .import-instructions .format {
        list-style: none;
        margin-left: -1rem;
        font-family: monospace;
        background: var(--bg-card);
        padding: 0.35rem 0.5rem;
        border-radius: var(--radius-xs);
        border: 1px dashed var(--gray-200);
    }

    .upload-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }

    .file-input {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm);
        border: 1px dashed var(--gray-300);
        border-radius: var(--radius-sm);
        cursor: pointer;
        background: var(--bg-main);
    }

    .file-input input {
        width: 100%;
    }

    .checkbox {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 0.85rem;
    }
    
    button {
        border: none;
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    button.primary {
        background: var(--green-500);
        color: white;
    }
    
    button.primary:hover {
        background: var(--green-700);
    }

    .import-trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-sm);
        background: var(--bg-card);
    }

    .chevron {
        font-size: 0.9rem;
        opacity: 0.7;
    }

    dialog.import-modal {
        border: none;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        background: var(--bg-card);
        color: var(--text-main);
        width: min(560px, 92vw);
        max-height: 90vh;
        padding: 0;
    }

    dialog.import-modal::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }

    .modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-md);
        border-bottom: 1px solid var(--gray-200);
    }

    .modal-body {
        padding: var(--space-md);
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: var(--space-md);
        border-top: 1px solid var(--gray-200);
        background: var(--bg-card);
    }

    .icon-btn {
        border: 1px solid var(--gray-200);
        background: var(--surface-2);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        padding: 0;
        display: grid;
        place-items: center;
        font-size: 0.9rem;
    }

    .ghost {
        background: transparent;
        border: 1px solid var(--gray-200);
        color: var(--text-main);
    }
</style>
