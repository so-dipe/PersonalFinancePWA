import { constructEmailQuery, ensureValidToken, listTransactionEmails, getEmailContent } from "./google";

function parseTransactionEmail(body, date, sender) {
    const amountMatch = body.match(/NGN\s?([\d,]+\.\d{2})/);
    const dateMatch = body.match(/on\s([A-Za-z]{3}\s\d{1,2},\s\d{4})/);
    const descriptionMatch = body.match(/for\s(.+?)\s(?:on|using)/);

    return {
        amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null,
        description: descriptionMatch ? descriptionMatch[1].trim() : "",
    }
}

export async function getTransactionsFromGmail(from="", subject="Transaction Notification", afterDate="") {
    const token = await ensureValidToken();
    const query = constructEmailQuery(from, subject, afterDate);
    const emails = await listTransactionEmails(query, token);

    const emailContents = await Promise.all(
        emails.map(email => getEmailContent(email.id, token))
    );

    const transactions = emailContents.map(email => {
        let body = "";
        const payload = email.payload;

        if (payload.parts) {
            const part = payload.parts.find(p => p.mimeType === 'text/plain') || payload.parts[0];
            body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (payload.body?.data) {
            body = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }

        const fromHeader = payload.headers.find(h => h.name.toLowerCase() === 'from')?.value || "Unknown Sender";
        const emailDateHeader = payload.headers.find(h => h.name.toLowerCase() === 'date')?.value;
        const emailDate = emailDateHeader ? new Date(emailDateHeader) : new Date(parseInt(email.internalDate));
        const parsed = parseTransactionEmail(body);

        return {
            ...parsed,
            sender: fromHeader,
            date: emailDate.toISOString()
        }
    });
    return transactions;
};