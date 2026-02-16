import { writable } from "svelte/store";

export const syncState = writable({
    inProgress: false,
    status: 'idle',
    message: ""
});