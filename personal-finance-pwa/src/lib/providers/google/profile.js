import { writable } from "svelte/store";
import { ensureDriveToken } from "./drive";

export const googleProfile = writable(null);

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