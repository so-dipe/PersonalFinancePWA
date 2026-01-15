import { ensureDriveToken } from "$lib/google";
import { uploadFile, updateFile, listDriveFiles, downloadFile } from "$lib/google";
import { saveSettings } from "$lib/settings/store";

export async function pushSettingsToDrive(settings) {
    const files = await listDriveFiles('settings');

    const file = files?.find(f => f.name === 'settings.json');

    if (!file) {
        await uploadFile('settings.json', settings);
        return;
    }

    const remoteModified = file.appProperties?.m ? new Date(file.appProperties.m) : null;
    const localModified = new Date(settings.modifiedAt);

    if (!remoteModified || localModifed > remoteModified) {
        await updateFile(file.id, settings)
    }
}

export async function pullSettingsFromDrive(localSettings) {
    const files = await listDriveFiles('settings.json')

    const file = files?.find(f => f.name === 'settings.json')
    if (!file) return null;

    const remote = await downloadFile(file.id)

    const localModified = new Date(settings.modifiedAt);
    const remoteModified = new Date(remote.modifiedAt);

    if (remoteModified > localModified) {
        await saveSettings(remote);
        return remote;
    }
    return localSettings;
}