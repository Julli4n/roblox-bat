"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeEntities = exports.TOKEN_SIGNATURE_ALGORITHM = exports.FORCE_BAT_URLS = exports.DEFAULT_INDEXED_DB_VERSION = exports.MATCH_ROBLOX_URL_BASE = exports.AUTH_TOKEN_SEPARATOR = exports.FETCH_AUTHENTICATED_URL = exports.FETCH_TOKEN_METADATA_REGEX = exports.FETCH_TOKEN_METADATA_SELECTOR = exports.FETCH_TOKEN_METADATA_URL = exports.FETCH_TOKEN_URL = exports.TOKEN_HEADER_NAME = void 0;
exports.TOKEN_HEADER_NAME = "x-bound-auth-token";
exports.FETCH_TOKEN_URL = "https://apis.roblox.com/hba-service/v1/getServerNonce";
exports.FETCH_TOKEN_METADATA_URL = "https://www.roblox.com/reference/blank";
exports.FETCH_TOKEN_METADATA_SELECTOR = 'meta[name="hardware-backed-authentication-data"]';
exports.FETCH_TOKEN_METADATA_REGEX = /name="hardware-backed-authentication-data"(\s|.)+?data-is-secure-authentication-intent-enabled="(.+?)"(\s|.)+?data-is-bound-auth-token-enabled="(.+?)"(\s|.)+?data-bound-auth-token-whitelist="(.+?)"(\s|.)+?data-bound-auth-token-exemptlist="(.+?)"(\s|.)+?data-hba-indexed-db-name="(.+?)"(\s|.)+?data-hba-indexed-db-obj-store-name="(.+?)"(\s|.)+?data-hba-indexed-db-key-name="(.+?)"(\s|.)+?data-hba-indexed-db-version="(.+?)"/;
exports.FETCH_AUTHENTICATED_URL = "https://users.roblox.com/v1/users/authenticated";
exports.AUTH_TOKEN_SEPARATOR = "|";
exports.MATCH_ROBLOX_URL_BASE = ".roblox.com";
exports.DEFAULT_INDEXED_DB_VERSION = 1;
exports.FORCE_BAT_URLS = [
    "/account-switcher/v1/switch"
];
exports.TOKEN_SIGNATURE_ALGORITHM = {
    name: "ECDSA",
    hash: { name: "SHA-256" }
};
function decodeEntities(encodedString) {
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
exports.decodeEntities = decodeEntities;
