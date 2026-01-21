import { initTokenClient, SCOPES, getCachedToken, requestToken } from "./auth";

export async function ensureGmailToken({ interactive = false} = {}) {
    initTokenClient('GMAIL', SCOPES.GMAIL);

    const cached = await getCachedToken('GMAIL');
    if (cached) return cached;

    if (!interactive) return null;
    return requestToken('GMAIL');
}
export function constructEmailQuery(from='', subject='', afterDate='') {
    let query = '';
    if (from) query += `from:${from} `;
    if (subject) query += `subject:(${subject}) `;
    if (afterDate) {
        const timestamp = Math.floor(new Date(afterDate).getTime() / 1000);
        query += `after:${timestamp} `;
    }
    return query.trim();
}

export async function listTransactionEmails(query) {
    const token = await ensureGmailToken({ interactive: true});

    if (!token) return [];

    gapi.client.setToken({access_token: token});

    const response = await gapi.client.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 20
    });

    return response.result?.messages ?? [];
}

export async function getEmailContent(messageId, token) {
    gapi.client.setToken({access_token: token});
    const response = await gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
    });

    return response.result;
}
