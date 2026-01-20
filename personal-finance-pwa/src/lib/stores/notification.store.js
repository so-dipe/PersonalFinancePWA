import { writable } from "svelte/store";

export const notifications = writable([]);

export function notify(notification) {
    const id = crypto.randomUUID();

    notifications.update(n => [
        ...n,
        {
            id,
            dismissible: true,
            timeout: 4000,
            ...notification
        }
    ]);

    if (notification.timeout !== 0) {
        setTimeout(() => {
            notifications.update(n => n.filter(x => x.id !== id));
        }, notification.timeout ?? 4000);
    }
}