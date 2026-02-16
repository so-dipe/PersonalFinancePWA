import { initTokenClient, SCOPES, getCachedToken, requestToken } from "./auth";

export async function ensureDriveToken({ interactive = false} = {}) {
    initTokenClient('DRIVE', SCOPES.DRIVE_ID);

    const cached = await getCachedToken('DRIVE');
    if (cached) return cached;

    if (!interactive) return null;
    return requestToken('DRIVE');
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

    let allFiles = [];
    let pageToken = null;

    do {
        const response = await gapi.client.drive.files.list({
            spaces: 'appDataFolder',
            q: `name contains '${entityName}'`,
            fields: `files(id,name,appProperties)`,
            pageSize: 1000,
            pageToken: pageToken
        });
        allFiles.push(...(response.result.files || []));
        pageToken = response.result.nextPageToken;
    } while (pageToken);

    return allFiles;
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
