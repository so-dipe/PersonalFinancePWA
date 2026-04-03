import { writable } from "svelte/store";

export const syncState = writable({
    inProgress: false,
    phase: 'idle', // idle | pulling | pushing | finalizing | success | error
    entity: null,
    progress: {
        current: 0,
        total: 0,
        percentage: 0
    },
    status: 'idle', // might be deprecated
    message: ""
});

export function createProgressReporter() {
    let current = 0;
    let total = 0;

    return {
        setTotal(n) {
            total = n;
        },
        step(message, extra = {}) {
            current++;

            syncState.set({
                inProgress: true,
                phase: extra.phase ?? 'syncing',
                entity: extra.entity ?? null,
                message,
                progress: {
                    current, total,
                    percentage: total 
                        ? Math.round((current / total) * 100)
                        : 0
                }
            })
        }
    }
}