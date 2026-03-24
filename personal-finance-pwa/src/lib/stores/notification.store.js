import { writable } from "svelte/store";

export const notifications = writable([]);
const MAX_NOTIFICATIONS = 5;

export function notify(notification) {
    const id = crypto.randomUUID();

    const severity = notification.severity || notification.type || "info";
    const dismissible = notification.dismissible ?? "true";
    const timeout = notification.timeout ?? 4000;

    const newNotification = {
        id,
        severity,
        dismissible,
        timeout,
        ...notification
    }

    notifications.update(n => {
        const next = [...n, newNotification];
        return next.slice(-MAX_NOTIFICATIONS);
    });

    if (timeout !== 0) {
        setTimeout(() => {
            notifications.update(n => n.filter(x => x.id !== id));
        }, timeout);
    }

    return id;
}

export function dismissNotification(id) {
    notifications.update(n => n.filter(x => x.id !== id));
}

export function clearAllNotifications() {
    notifications.set([]);
}