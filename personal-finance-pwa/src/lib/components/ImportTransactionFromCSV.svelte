<script>
    import { addTransaction, addTransactionsBulk } from '$lib/db';
    import { runImportPipeline } from '$lib/import/pipeline';
    import { normalizeToISODate } from '$lib/utils';
    import { json } from '@sveltejs/kit';
    import * as XLSX from 'xlsx';
    import Accordion from './Accordion.svelte';
    import ImportDialog from './ImportDialog.svelte';
    import { notify } from '$lib/notification/store';

    let file;
    let transactions = [];
    let hasHeader = false;
    
    let showDialog = false;
    let loading = false;

    function handleFileChange(event) {
        file = event.target.files[0];
    }

    function isCSV(file) {
        return file.name.toLowerCase().endsWith('.csv');
    }

    async function processRows(rows) {
        const raw = rows
            .filter(r => r.length >= 4)
            .map(r => ({
                date: normalizeToISODate(r[0]),
                transactionType: r[1] ?? 'expense',
                description: r[2] || '',
                amount: r[3] ?? 0,
                category: r[4] || '',
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
                    const workbook = XLSX.read(text, { type: 'string' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                } else {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                }

                rows = hasHeader ? rows.slice(1) : rows;

                if (!rows.length) throw new Error("No data found");

                await processRows(rows);
            } catch (err) {
                console.error(err);
                notify({ type: "error", message: "❌ Import failed" });
            } finally {
                loading = false;
            }
        };

        reader.onerror = () => (loading = false);

        if (isCSV(file)) {
            reader.readAsText(file);        // ✅ REQUIRED on mobile
        } else {
            reader.readAsArrayBuffer(file); // ✅ Excel only
        }
    }

    function commitImport() {
        try {
            const readyTransactions = transactions.filter(
                (tx) => tx.status === "ready"
            );
            addTransactionsBulk(readyTransactions);
            showDialog = false;
        } catch (err) {
            notify({ type: "error", message: "❌Oops...Import failed."})
        }
    }
</script>

<Accordion title="Import from CSV/Excel">
    <div class="import-instructions">
        <h4>Before importing your file</h4>
        <ul>
            <li>Ensure your data is in the <strong>first sheet</strong> of the file</li>
            <li>Columns must be in this order:</li>
            <li class="format">
                Date | Transaction Type | Description | Amount | Description
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
        <button class="primary" on:click={importFile} disabled={loading}>
            {loading ? 'Loading...': 'Load Transactions'}
        </button>
    </div>
</Accordion>
{#if showDialog}
    <ImportDialog
        {transactions}
        onClose={() => (showDialog = false)}
        onCommit={commitImport}
    />
{/if}

<style>
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
</style>
