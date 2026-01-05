import { writable } from "svelte/store";
import { db } from "./db";
import { resolve } from "$app/paths";

export const googleToken = writable(null);

const CLIENT_ID = '1088000417078-7kdb0m71l7hod2jmjlh5tnksj3kr6f46.apps.googleusercontent.com';

const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

let tokenClient;
let pendingResolve;
let pendingReject;

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

function requestToken(prompt = '') {
    return new Promise((resolve, reject) => {
        pendingResolve = resolve;
        pendingReject = reject;
        tokenClient.requestAccessToken({prompt});
    });
}

function handleTokenResponse(response) {
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

    return requestToken();        
}

export function login() {
    if (!tokenClient) initGoogleAuth();
    tokenClient.requestAccessToken({prompt: 'consent'});
}

export async function uploadFile(entityName, filename, data, token) {
    const folderId = await ensureFolder(entityName, token);

    const metadata = {
        name: filename,
        parents: [folderId]
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
    const folderId = await ensureFolder(entityName, token);
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id, name)`,
        { headers: {Authorization: `Bearer ${token}`}}
    );
    const data = await response.json()
    return data.files || [];
}

export async function downloadFile(fileID, token) {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileID}?alt=media`,
        { headers: {Authorization: `Bearer ${token}`}}
    );
    return await response.json()
}

async function ensureFolder(name, token) {
    const q = `name='${name}'+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false+and+'appDataFolder'+in+parents`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Drive list folders failed: ${res.status} ${res.statusText} - ${text}`);
    }

    const data = await res.json();

    if (Array.isArray(data.files) && data.files.length) return data.files[0].id;

    const metadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: ['appDataFolder']
    };

    const createRes = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(metadata)
        }
    );

    if (!createRes.ok) {
        const text = await createRes.text();
        throw new Error(`Drive create folder failed: ${createRes.status} ${createRes.statusText} - ${text}`);
    }

    const folder = await createRes.json();
    console.log('Created Drive folder:', folder);
    return folder.id;
}
