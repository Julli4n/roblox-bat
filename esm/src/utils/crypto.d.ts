import * as dntShim from "../../_dnt.shims.js";
export declare function hashStringSha256(str?: string): Promise<string>;
export declare function arrayBufferToBase64String(arrayBuffer: ArrayBuffer): string;
export declare function signWithKey(privateKey: dntShim.CryptoKey, data: string): Promise<string>;
export declare function getCryptoKeyPairFromDB(dbName: string, dbObjectName: string, dbObjectChildId: string): Promise<dntShim.CryptoKeyPair | null>;
