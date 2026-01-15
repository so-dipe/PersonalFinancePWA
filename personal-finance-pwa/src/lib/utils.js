export function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

export function formatDateTime(dateStr) {
    const date = new Date(dateStr);

    const options = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    };

    return date.toLocaleString("en-GB", options);
}

export function formatFinancial(amount, isNegative = false) {
    const formatted = amount.toLocaleString("en-NG", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return isNegative ? `( ${formatted} )` : formatted;
}

export function formatAmount(amount) {
    if (!amount) return;
    return amount.toLocaleString("en-NG", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

export function decodeBase64Url(base64UrlString) {
    const base64 = base64UrlString.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const base64Padded = base64 + padding;
    const decodedString = atob(base64Padded);
    return decodedString;
}

export function parseEmailBody(body) {
    const lines = body.split('\n');
    const parsed = {};
    for (const line of lines) {
        const [key, ...rest] = line.split(':');
        if (key && rest.length > 0) {
            parsed[key.trim().toLowerCase()] = rest.join(':').trim();
        }
    }
    return parsed;
}

export function excelDateToJSDate(excelDate) {
    if (typeof excelDate !== 'number') {
        const date = new Date(excelDate);
        return !isNaN(date) ? date.toISOString().slice(0, 10) : null;
    }

    const utcDays = Math.floor(excelDate - 25569);
    const utcValue = utcDays * 86400; 
    return new Date(utcValue * 1000).toISOString().slice(0, 10);
}