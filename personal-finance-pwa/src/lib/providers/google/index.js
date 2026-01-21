import { normalizeDriveFile } from "./mapping";
import { listDriveFiles, downloadFile, uploadFile, ensureDriveToken } from "./drive";
import { driveToken, loadGoogleApi } from "./auth";
import { fetchGoogleProfile } from "./profile";

export const googleDriveProvider = {
    init: loadGoogleApi,
    async listFiles(entity) {
        const files = await listDriveFiles(entity);
        return files.map(normalizeDriveFile);
    },
    downloadFile,
    uploadFile,
    connect: async () => {
        const token = await ensureDriveToken({interactive: false}) ?? await ensureDriveToken({interactive: true});
        if (!token) return null;
        const profile = await fetchGoogleProfile();
        return profile;
    },
    disconnect: async () => {
        localStorage.removeItem('g_token_drive');
        driveToken.set(null);
    }
}