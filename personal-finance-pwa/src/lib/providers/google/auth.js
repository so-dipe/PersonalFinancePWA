import { writable } from "svelte/store";
import { db } from "$lib/db";

export const driveToken = writable(null);
export const gmailToken = writable(null);
export const googleProfile = writable(null);

const CLIENT_ID = '1088000417078-7kdb0m71l7hod2jmjlh5tnksj3kr6f46.apps.googleusercontent.com';

export const SCOPES = {
    DRIVE_ID: [
        'openid', 'profile', 'email', 'https://www.googleapis.com/auth/drive.appdata'
    ].join(' '),
    GMAIL: 'https://www.googleapis.com/auth/gmail.readonly'
}

const tokenClients = {};
const pending = {};

let googleApiLoaded = false;
let identityInitialized = false;

export function initTokenClient(scopeKey, scope) {
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
