export function errorToNotification(err) {
    switch(err.code) {
        case "TX_DUPLICATE":
            return {
                type: "warning",
                message: "This transaction already exists."
            };
        case "TX_SAVE_FAILED":
            return {
                type: "error",
                message: "Failed to save transaction. Please try again."
            }
        
        default:
            return {
                type: "error",
                message: "Something went wrong. Please try again."
            }
    }
}