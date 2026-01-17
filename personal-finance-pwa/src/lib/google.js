import { writable } from "svelte/store";
import { db } from "./db";
import { resolve } from "$app/paths";

export const driveToken = writable(null);
export const gmailToken = writable(null);

export const googleProfile = writable(null);

const CLIENT_ID = '1088000417078-7kdb0m71l7hod2jmjlh5tnksj3kr6f46.apps.googleusercontent.com';

const SCOPES = {
    DRIVE_ID: [
        'openid', 'profile', 'email', 'https://www.googleapis.com/auth/drive.appdata'
    ].join(' '),
    GMAIL: 'https://www.googleapis.com/auth/gmail.readonly'
}

const tokenClients = {};
const pending = {};

let googleApiLoaded = false;
let identityInitialized = false;

function initTokenClient(scopeKey, scope) {
    if (tokenClients[scopeKey]) return;

    tokenClients[scopeKey] = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope,
        callback: (response) => handleTokenResponse(scopeKey, response)
    });
}

function tokenKey(scopeKey) {
    return `g_token_${scopeKey}`;
}

function expiryKey(scopeKey) {
    return `g_expiry_${scopeKey}`;
}

export function loadGoogleApi() {
    return new Promise((resolve) => {
        if (googleApiLoaded) return resolve();

        window.gapi.load('client', async () => {
            await window.gapi.client.init({
                apiKey: '',
                discoveryDocs: [
                    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
                    'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'
                ]
            });
            googleApiLoaded = true;
            resolve();
        });
    });
}

function handleTokenResponse(scopeKey, response) {
    if (response.error) {
        pending[scopeKey]?.reject(response.error);
        pending[scopeKey] = null;
        return;
    }

    const expiresAt = Date.now() + response.expires_in * 1000;

    localStorage.setItem(tokenKey(scopeKey), response.access_token);
    localStorage.setItem(expiryKey(scopeKey), expiresAt.toString());

    if (scopeKey === 'DRIVE') driveToken.set(response.access_token);
    if (scopeKey === 'GMAIL') gmailToken.set(response.access_token);

    pending[scopeKey]?.resolve(response.access_token);
    pending[scopeKey] = null;
}

export async function getCachedToken(scopeKey) {
    const token = localStorage.getItem(tokenKey(scopeKey));
    const expiry = localStorage.getItem(expiryKey(scopeKey));

    if (token && expiry && Date.now() < parseInt(expiry) - 60_000) {
        if (scopeKey === 'DRIVE') driveToken.set(token);
        if (scopeKey === 'GMAIL') gmailToken.set(token);
        return token;
    }
    return null;
}

export function requestToken(scopeKey, prompt = '') {
    return new Promise((resolve, reject) => {
        pending[scopeKey] = { resolve, reject };
        tokenClients[scopeKey].requestAccessToken({ prompt });
    });
}

export async function ensureDriveToken({ interactive = false} = {}) {
    initTokenClient('DRIVE', SCOPES.DRIVE_ID);

    const cached = await getCachedToken('DRIVE');
    if (cached) return cached;

    if (!interactive) return null;
    return requestToken('DRIVE');
}

export async function ensureGmailToken({ interactive = false} = {}) {
    initTokenClient('GMAIL', SCOPES.GMAIL);

    const cached = await getCachedToken('GMAIL');
    if (cached) return cached;

    if (!interactive) return null;
    return requestToken('GMAIL');
}

export async function uploadFile(filename, data) {
    const token = await ensureDriveToken({ interactive: true});
    if (!token) throw new Error('Drive access not granted');

    const metadata = {
        name: filename,
        parents: ['appDataFolder'],
        appProperties: {
            u: data.uuid,
            m: data.modifiedAt,
            c: data.createdAt,
            s: data.synced ? 1 : 0,
            d: data.deleted ? 1 : 0
        }
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formData
    });

    if (!response.ok) throw new Error("Upload Failed");
    return response.json();
}

export async function updateFile(fileId, data) {
    const token = await ensureDriveToken({ interactive: true});
    if (!token) throw new Error('Drive access not granted');

    const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
    )
    if(!response.ok) throw new Error('Failed to update file');
}

export async function listDriveFiles(entityName) {
    const token = await ensureDriveToken({ interactive: true});
    if (!token) throw new Error('Drive access not granted');

    gapi.client.setToken({access_token: token});
    const response = await gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        q: `name contains '${entityName}'`,
        fields: `files(id,name,appProperties)`
    });

    return response.result?.files;
}

export async function downloadFile(fileID) {
    const token = await ensureDriveToken({ interactive: true});
    if (!token) throw new Error('Drive access not granted');

    gapi.client.setToken({access_token: token});
    const response = await gapi.client.drive.files.get({
        fileId: fileID,
        alt: 'media'
    });

    return response.result;
}

//GMAIL FUNCTIONS

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

//GOOGLE ID

export async function fetchGoogleProfile() {
    const token = await ensureDriveToken({ interactive: true })
    if (!token) throw new Error('Not authenticated.');

    const res = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
            headers: { Authorization: `Bearer ${token}`}
        }
    );

    if (!res.ok) throw new Error('Failed to fetch profile.');

    const data = await res.json();

    const profile = {
        name: data.name,
        email: data.email,
        picture: data.picture
    };

    googleProfile.set(profile);
    return profile;
}