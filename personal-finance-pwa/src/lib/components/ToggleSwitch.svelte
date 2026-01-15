<script>
    import { createEventDispatcher } from "svelte";

    export let checked = false;
    export let label = '';
    export let disabled = false;

    const dispatch = createEventDispatcher();

    function toggle() {
        if (disabled) return;
        dispatch('change', event.target.checked);
    }
</script>

<label class="toggle">
    <span class="label">{label}</span>

    <input type="checkbox" bind:checked disabled={disabled} on:change={toggle}/>

    <span class="switch"></span>
</label>

<style>
    .toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        cursor: pointer;
        gap: var(--space-md);
    }

    .toggle input {
        display: none;
    }

    .switch {
        width: 48px;
        height: 26px;
        background: var(--gray-700);
        border-radius: 999px;
        position: relative;
        transition: background 0.2s ease;
    }

    .switch::after {
        content: '';
        width: 22px;
        height: 22px;
        background: white;
        border-radius: 50%;
        position: absolute;
        top: 2px;
        left: 2px;
        transition: transform 0.2s ease;
    }

    input:checked + .switch {
        background: var(--green-700);
    }

    input:checked + .switch::after {
        transform: translateX(22px);
    }

    input:disabled + .switch {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .label {
        font-weight: 600;
        font-size: 1.1rem;
    }
</style>