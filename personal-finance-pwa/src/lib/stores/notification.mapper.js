const ERROR_MAP = {
    TX_DUPLICATE: {
        severity: "warning",
        title: "Duplicate Transaction",
        message: "This transaction already exists.",
        hint: "You can safely skip this transaction.",
        retryable: false
    },


    TX_SAVE_FAILED: {
        severity: "error",
        title: "Transaction Failed",
        message: "Failed to save transaction.",
        hint: "Please try again.",
        retryable: true
    },


    TX_EDIT_FAILED: {
        severity: "error",
        title: "Edit Failed",
        message: "Editing the transaction failed.",
        hint: "Your changes were not saved.",
        retryable: true
    },


    TX_DUPLICATE_EDIT: {
        severity: "error",
        title: "Duplicate Transaction",
        message: "Your edits would create a duplicate transaction.",
        hint: "Please adjust the transaction details.",
        retryable: false
    },


    TX_NOT_FOUND: {
        severity: "error",
        title: "Transaction Not Found",
        message: "This transaction no longer exists.",
        hint: "It may have been deleted.",
        retryable: false
    },


    CAT_DUPLICATE: {
        severity: "warning",
        title: "Duplicate Category",
        message: "This category already exists.",
        hint: "Try using the existing category.",
        retryable: false
    },


    CAT_SAVE_FAILED: {
        severity: "error",
        title: "Category Failed",
        message: "Failed to save category.",
        hint: "Please try again.",
        retryable: true
    },


    USER_NOT_AUTHORIZED: {
        severity: "error",
        title: "Access Denied",
        message: "You are not authorized to perform this action.",
        hint: "Please contact an administrator.",
        retryable: false
    },


    NETWORK_ERROR: {
        severity: "error",
        title: "Network Error",
        message: "Network issue detected.",
        hint: "Check your internet connection and try again.",
        retryable: true
    }
};

function normalizeError(e) {
    if (!e || typeof e !== "object") {
        return {
            severity: "error",
            title: "Unexpected Error",
            message: "Something went wrong",
            hint: "Please try again.",
            retryable: true,
            meta: {}
        };
    }

    return {
        severity: "error",
        title: "Unexpected Error",
        message: e.message || "Something went wrong",
        hint: "Please try again.",
        retryable: true,
        meta: e.meta || {}
    }
}

export function errorToNotification(e) {
    if (!e?.code || !ERROR_MAP[e.code]) {
        console.warn("Unhandled error code: ", e)
        return normalizeError(e);
    }

    const base = ERROR_MAP[e.code]

    return {
        code: e.code,
        severity: base.severity,
        title: base.title,
        message: base.message,
        hint: base.hint,
        retryable: base.retryable,
        meta: e.meta || {}
    }
}