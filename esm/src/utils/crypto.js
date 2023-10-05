import { TOKEN_SIGNATURE_ALGORITHM } from "./constants.js";
export async function hashStringSha256(str) {
    const uint8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest(TOKEN_SIGNATURE_ALGORITHM.hash.name, uint8);
    return arrayBufferToBase64String(hashBuffer);
}
export function arrayBufferToBase64String(arrayBuffer) {
    let res = "";
    const bytes = new Uint8Array(arrayBuffer);
    // can't just do new TextDecoder().decode(arrayBuffer) :(
    for (let i = 0; i < bytes.byteLength; i++) {
        res += String.fromCharCode(bytes[i]);
    }
    return btoa(res);
}
export async function signWithKey(privateKey, data) {
    const bufferResult = await crypto.subtle.sign(TOKEN_SIGNATURE_ALGORITHM, privateKey, new TextEncoder().encode(data).buffer);
    return arrayBufferToBase64String(bufferResult);
}
export function doesDatabaseExist(dbName) {
    return new Promise((resolve) => {
        const db = indexedDB.open(dbName);
        db.onsuccess = () => {
            db.result.close();
            resolve(true);
        };
        db.onupgradeneeded = (evt) => {
            evt.target?.transaction?.abort();
            resolve(false);
        };
    });
}
export async function getCryptoKeyPairFromDB(dbName, dbObjectName, dbObjectChildId) {
    let targetVersion = 1;
    // we want Roblox to create the DB on their end, so we do not want to interfere
    if ("databases" in indexedDB) {
        const databases = await indexedDB.databases();
        const database = databases.find((db) => db.name === dbName);
        if (!database) {
            return null;
        }
        if (database?.version) {
            targetVersion = database.version;
        }
    }
    else {
        if (!await doesDatabaseExist(dbName)) {
            return null;
        }
    }
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, targetVersion);
        request.onsuccess = () => {
            try {
                const db = request.result;
                const transaction = db.transaction(dbObjectName, "readonly");
                const objectStore = transaction.objectStore(dbObjectName);
                const get = objectStore.get(dbObjectChildId);
                get.onsuccess = () => {
                    resolve(get.result);
                };
                get.onerror = () => {
                    reject(request.error);
                };
                transaction.oncomplete = () => {
                    db.close();
                };
            }
            catch (err) {
                reject(err);
            }
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}
