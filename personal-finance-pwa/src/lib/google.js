import { writable } from "svelte/store";
import { db } from "./db";
import { resolve } from "$app/paths";

export const googleToken = writable(null);

const CLIENT_ID = '1088000417078-7kdb0m71l7hod2jmjlh5tnksj3kr6f46.apps.googleusercontent.com';

const SCOPES = [
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/gmail.readonly'
].join(' ');

let tokenClient;
let pendingResolve;
let pendingReject;

let googleApiLoaded = false;

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

export function initGoogleAuth() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: handleTokenResponse
    });

    const savedToken = localStorage.getItem('g_token');
    const expiry = localStorage.getItem('g_expiry');

    if (savedToken && expiry && Date.now() < parseInt(expiry)) {
        googleToken.set(savedToken)
        return;
    }
}

function requestNewToken(prompt = '') {
    return new Promise((resolve, reject) => {
        pendingResolve = resolve;
        pendingReject = reject;
        console.log('Requesting new token with prompt:', prompt);
        tokenClient.requestAccessToken({prompt});
    });
}

function handleTokenResponse(response) {
    console.log('Token response:', response);
    if (response.error) {
        googleToken.set(null);
        pendingReject?.(response.error);
        pendingResolve = pendingReject = null
        return;
    }

    const expiresAt = Date.now() + response.expires_in * 1000;

    localStorage.setItem('g_token', response.access_token);
    localStorage.setItem('g_expiry', expiresAt.toString());

    googleToken.set(response.access_token);

    pendingResolve?.(response.access_token);
    pendingResolve = pendingReject = null;
}

export async function ensureValidToken() {
    const token = localStorage.getItem('g_token');
    const expiry = localStorage.getItem('g_expiry');

    if (token && expiry && Date.now() < parseInt(expiry) - 60000) {
        googleToken.set(token);
        return Promise.resolve(token);
    }

    return requestNewToken();        
}

export function login() {
    if (!tokenClient) initGoogleAuth();
    tokenClient.requestAccessToken({prompt: 'consent'});
}

export async function uploadFile(filename, data, token) {
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

export async function listDriveFiles(entityName, token) {
    gapi.client.setToken({access_token: token});
    const response = await gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        q: `name contains '${entityName}-'`,
        fields: `files(id,name,appProperties)`
    });

    return response.result?.files;
}

export async function downloadFile(fileID, token) {
    gapi.client.setToken({access_token: token});
    const response = await gapi.client.drive.files.get({
        fileId: fileID,
        alt: 'media'
    });

    return response.result;
}

//GMAIL FUNCTIONS

export async function listTransactionEmails(query, token) {
    gapi.client.setToken({access_token: token});
    const response = await gapi.client.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 100
    });

    return response.result?.messages || [];
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

export async function getEmailContent(messageId, token) {
    gapi.client.setToken({access_token: token});
    const response = await gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
    });

    return response.result;
}
