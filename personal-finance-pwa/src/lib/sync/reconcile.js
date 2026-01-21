export async function reconcileByFingerprint(entity, remoteItem) {
    if (!remoteItem.fingerprint) return null;

    return db[entity].where('fingerprint').equals(remoteItem.fingerprint).first();
}