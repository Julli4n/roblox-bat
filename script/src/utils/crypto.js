"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCryptoKeyPairFromDB = exports.signWithKey = exports.arrayBufferToBase64String = exports.hashStringSha256 = void 0;
const dntShim = __importStar(require("../../_dnt.shims.js"));
const constants_js_1 = require("./constants.js");
async function hashStringSha256(str) {
    const uint8 = new TextEncoder().encode(str);
    const hashBuffer = await dntShim.crypto.subtle.digest(constants_js_1.TOKEN_SIGNATURE_ALGORITHM.hash.name, uint8);
    return arrayBufferToBase64String(hashBuffer);
}
exports.hashStringSha256 = hashStringSha256;
function arrayBufferToBase64String(arrayBuffer) {
    let res = "";
    const bytes = new Uint8Array(arrayBuffer);
    // can't just do new TextDecoder().decode(arrayBuffer) :(
    for (let i = 0; i < bytes.byteLength; i++) {
        res += String.fromCharCode(bytes[i]);
    }
    return btoa(res);
}
exports.arrayBufferToBase64String = arrayBufferToBase64String;
async function signWithKey(privateKey, data) {
    const bufferResult = await dntShim.crypto.subtle.sign(constants_js_1.TOKEN_SIGNATURE_ALGORITHM, privateKey, new TextEncoder().encode(data).buffer);
    return arrayBufferToBase64String(bufferResult);
}
exports.signWithKey = signWithKey;
function getCryptoKeyPairFromDB(dbName, dbObjectName, dbObjectChildId) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
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
exports.getCryptoKeyPairFromDB = getCryptoKeyPairFromDB;
