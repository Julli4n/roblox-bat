export const TOKEN_HEADER_NAME = "x-bound-auth-token";
export const FETCH_TOKEN_URL = "https://apis.roblox.com/hba-service/v1/getServerNonce";
export const FETCH_TOKEN_METADATA_URL = "https://www.roblox.com/reference/blank";
export const FETCH_TOKEN_METADATA_SELECTOR = 'meta[name="hardware-backed-authentication-data"]';
export const FETCH_TOKEN_METADATA_REGEX = /name="hardware-backed-authentication-data"(\s|.)+?data-is-secure-authentication-intent-enabled="(.+?)"(\s|.)+?data-is-bound-auth-token-enabled="(.+?)"(\s|.)+?data-bound-auth-token-whitelist="(.+?)"(\s|.)+?data-bound-auth-token-exemptlist="(.+?)"(\s|.)+?data-hba-indexed-db-name="(.+?)"(\s|.)+?data-hba-indexed-db-obj-store-name="(.+?)"/;
export const AUTH_TOKEN_SEPARATOR = "|";
export const MATCH_ROBLOX_URL_BASE = ".roblox.com";
export const TOKEN_SIGNATURE_ALGORITHM = {
    name: "ECDSA",
    hash: { name: "SHA-256" }
};
export function decodeEntities(encodedString) {
    const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    const translate = {
        "nbsp": " ",
        "amp": "&",
        "quot": "\"",
        "lt": "<",
        "gt": ">"
    };
    return encodedString.replace(translate_re, function (_, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function (_, numStr) {
        const num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}