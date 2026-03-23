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

export function formatAmountShort(amount) {
    if (amount >= 1e9) return (amount / 1e9).toFixed(1) + "B";
    if (amount >= 1e6) return (amount / 1e6).toFixed(1) + "M";
    if (amount >= 1e3) return (amount / 1e3).toFixed(1) + "K";

    return amount;
}

export function formatAmount(tx) {
    const formatted = tx.amount.toLocaleString("en-NG", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
    return tx.transactionType === 'expense' ? `(${formatted})` : formatted
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

export function normalizeToISODate(value) {
    if (typeof value === 'number') {
        const utcDays = Math.floor(value - 25569);
        const date = new Date(utcDays * 86400 * 1000);
        return date.toISOString().slice(0, 10);
    }

    // String or Date input
    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }

    if (typeof value === 'string') {
        // Handle DD/MM/YYYY explicitly (mobile-safe)
        const dmyMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (dmyMatch) {
            const [, d, m, y] = dmyMatch;
            return new Date(Date.UTC(y, m - 1, d))
                .toISOString()
                .slice(0, 10);
        }

        const parsed = new Date(value);
        return isNaN(parsed) ? null : parsed.toISOString().slice(0, 10);
    }

    return null;
}


export function getDefaultTransactionForm() {
    return {
        date: new Date().toISOString().slice(0, 10),
        transactionType: "expense",
        description: "",
        amount: "",
        categoryUuid: ""
    }
}

export function isValidISODate(date) {
    if (typeof date !== "string") return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

    const d = new Date(date);
    return !Number.isNaN(d.getTime());
}

export function getDefaultBudgetForm() {
    return {
        categoryUuid: "",
        description: "",
        amount: "",
        periodUnit: "month",
        periodCount: 1,
        startDate: new Date().toISOString().slice(0, 10)
    }
}