export const SETTINGS_VERSION = 1;

export const defaultSettings = {
    version: SETTINGS_VERSION,

    sync: {
        enabled: false,
        autoSync: false,
        lastSynced: null,
        status: 'idle'
    },

    display: {
        darkMode: false
    },

    account: {
        name: "random",
        email: "",
        picture: "/avatar.png"
    },

    uuid: 'settings',
    modifiedAt: '2026-01-01',
    createdAt: '2026-01-01',
    synced: 0,
    deleted: 0
}