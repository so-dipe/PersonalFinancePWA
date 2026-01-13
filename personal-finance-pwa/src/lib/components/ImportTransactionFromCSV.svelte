<script>
    import { excelDateToJSDate } from '$lib/utils';
    import { json } from '@sveltejs/kit';
    import * as XLSX from 'xlsx';

    let file;
    let transactions = [];

    let dialog;

    let cardVisible = false;

    let hasHeader = false;

    function toggleCard() {
        if (cardVisible) {
            dialog.close();
        } else {
            dialog.showModal();
        }
        cardVisible = !cardVisible;
    }

    function handleFileChange(event) {
        file = event.target.files[0];
    }

    function importFiles() {
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
            const rows = hasHeader ? jsonData.slice(1): jsonData;
            transactions = rows
                .filter(row => row.length)
                .map(row => ({
                    date: excelDateToJSDate(row[0]),
                    transactionType: row[1],
                    description: row[2],
                    amount: row[3],
                    category: row[4]
                }))
        }
        reader.readAsArrayBuffer(file);
    }
</script>
<button on:click={toggleCard}>Load Transactions from a CSV/Excel file</button>
<dialog bind:this={dialog}>
    <div class="import-container">
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
        <div class="import-form">
            <label class="file-input">
                <input type="file" accept=".csv, .xlsx, .xls" on:change={handleFileChange} />
            </label>

            <label class="checkbox">
                <input type="checkbox" id="hasHeader" bind:checked={hasHeader} disabled={!file}/>
                <span>First row is header</span>
            </label>

        </div>
        <div class="actions">
            <button class="primary" on:click={importFiles}>Import</button>
        </div>

        {#if transactions.length > 0}
            <h4>Imported Transactions:</h4>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {#each transactions as tx}
                        <tr>
                            <td>{tx.date}</td>
                            <td>{tx.transactionType}</td>
                            <td>{tx.description}</td>
                            <td>{tx.amount}</td>
                            <td>{tx.category}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
        <button on:click={toggleCard}>Close</button>
    </div>
</dialog>

<style>
    dialog {
        border: none;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        background: var(--bg-card);
        color: var(--text-main);
        padding: 0;
        max-width: 640px;
        width: 100%;
    }
    
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }
    
    .import-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        padding: var(--space-lg);
    }
    
    /* Instructions */
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
    
    /* Form */
    .import-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }
    
    /* File input */
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

    .checkbox {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
    }

    .actions {
        display: flex;
        justify-content: flex-center;
        gap: var(--space-sm);
        margin-top: var(--space-sm);
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
