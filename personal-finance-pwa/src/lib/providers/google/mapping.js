export function normalizeDriveFile(file) {
    return {
        id: file.id,
        name: file.name,
        metadata: {
            u: file.appProperties?.u,
            m: file.appProperties?.m,
            c: file.appProperties?.c,
            s: file.appProperties?.s,
            d: file.appProperties?.d
        }
    }
}