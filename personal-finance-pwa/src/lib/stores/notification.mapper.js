const ERROR_MAP = {
    TX_DUPLICATE: { type: "warning", message: "This transaction already exists." },
    TX_SAVE_FAILED: { type: "error", message: "Failed to save transaction. Please try again." },
    USER_NOT_AUTHORIZED: { type: "error", message: "You are not authorized to perform this action." },
    NETWORK_ERROR: { type: "error", message: "Network issue. Please check your connection." },
    CAT_DUPLICATE: { type: "warning", message: "This category already exists." },
    CAT_SAVE_FAILED: { type: "error", message: "Failed to save category. Please try again." },
    TX_NOT_FOUND: { type: "error", message: "Transaction not found"},
    TX_DUPLICATE_EDIT: { type: "error", message: "Edited transaction is a duplicate."},
    TX_EDIT_FAILED: { type: "error", message: "Editing Transaction failed."},
};

export function errorToNotification(e) {
    if (!ERROR_MAP[e.code]) console.warn("Unhandled error code: ", e);
    const base = ERROR_MAP[e.code] || {
        type: "error", 
        message: e.message || "Something went wrong. Please try again."
    };
    return { ...base, meta: e.meta || {} };
}