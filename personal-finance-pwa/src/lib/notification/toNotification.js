const ERROR_MAP = {
    TX_DUPLICATE: { type: "warning", message: "This transaction already exists." },
    TX_SAVE_FAILED: { type: "error", message: "Failed to save transaction. Please try again." },
    USER_NOT_AUTHORIZED: { type: "error", message: "You are not authorized to perform this action." },
    NETWORK_ERROR: { type: "error", message: "Network issue. Please check your connection." }
};

export function errorToNotification(err) {
    return ERROR_MAP[err.code] || { type: "error", message: err.message || "Something went wrong. Please try again." };
}