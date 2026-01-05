import { writable } from "svelte/store";
import { db } from "./db";
import { resolve } from "$app/paths";

export const googleToken = writable(null);

const CLIENT_ID = '1088000417078-7kdb0m71l7hod2jmjlh5tnksj3kr6f46.apps.googleusercontent.com';

const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

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
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
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
    const q = `name contains '${entityName}-' and 'appDataFolder' in parents and trashed=false`;

    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&spaces=appDataFolder&fields=files(id, name)`,
        { headers: {Authorization: `Bearer ${token}`}}
    );
    if (!response.ok) throw new Error("List Files Failed");

    const data = await response.json()

    return data?.files;
}

export async function downloadFile(fileID, token) {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileID}?alt=media`,
        { headers: {Authorization: `Bearer ${token}`}}
    );
    return await response.json()
}

// async function ensureFolder(name, token) {
//     const q = `name='${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed=false and 'appDataFolder' in parents`;
//     const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&spaces=appDataFolder&fields=files(id,name)`;
//     const res = await gapi.client.drive.files.list({q: q, spaces: 'appDataFolder', fields: 'files(id,name)'});
    
//     //fetch(url, { headers: { Authorization: `Bearer ${token}` } });

//     if (!res.ok) {
//         const text = await res.text();
//         throw new Error(`Drive list folders failed: ${res.status} ${res.statusText} - ${text}`);
//     }

//     // const data = await res.json();
//     const files = res.result.files;

//     if (files && files.length) return files[0].id;

//     // if (Array.isArray(data.files) && data.files.length) return data.files[0].id;

//     const metadata = {
//         name: name,
//         mimeType: 'application/vnd.google-apps.folder',
//         parents: ['appDataFolder']
//     };

//     const createRes = await gapi.client.drive.files.create({
//         resource: metadata,
//         fields: 'id, name'
//     });
    
//     // await fetch(
//     //     'https://www.googleapis.com/drive/v3/files',
//     //     {
//     //         method: 'POST',
//     //         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
//     //         body: JSON.stringify(metadata)
//     //     }
//     // );

//     if (!createRes.ok) {
//         const text = await createRes.text();
//         throw new Error(`Drive create folder failed: ${createRes.status} ${createRes.statusText} - ${text}`);
//     }

//     // const folder = await createRes.json();
//     console.log('Created Drive folder:', createRes.result);
//     return createRes.result.id;
// }
