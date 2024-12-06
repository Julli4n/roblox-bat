export declare const TOKEN_HEADER_NAME = "x-bound-auth-token";
export declare const FETCH_TOKEN_METADATA_SELECTOR = "meta[name=\"hardware-backed-authentication-data\"]";
export declare const FETCH_USER_DATA_SELECTOR = "meta[name=\"user-data\"]";
export declare const FETCH_TOKEN_METADATA_REGEX: RegExp;
export declare const FETCH_USER_DATA_REGEX: RegExp;
export declare const AUTH_TOKEN_SEPARATOR = "|";
export declare const DEFAULT_FETCH_TOKEN_METADATA_URL = "https://www.roblox.com/charts";
export declare const DEFAULT_MATCH_ROBLOX_URL_BASE = ".roblox.com";
export declare const DEFAULT_INDEXED_DB_VERSION = 1;
export declare const DEFAULT_FORCE_BAT_URLS: string[];
export declare const BAT_SIGNATURE_VERSION = "v1";
export declare const TOKEN_SIGNATURE_ALGORITHM: EcdsaParams & {
    hash: {
        name: string;
    };
};
export declare function decodeEntities(encodedString: string): string;
