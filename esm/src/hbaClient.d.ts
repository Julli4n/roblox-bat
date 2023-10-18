export type HBAClientConstProps = {
    /**
     * The fetch to be wrapped.
     */
    fetch?: (url: string, params?: RequestInit) => Promise<Response>;
    /**
     * Base request headers.
     */
    headers?: Record<string, unknown> | Headers;
    /**
     * Whether the current context is on the Roblox site, and will use credentials.
     */
    onSite?: boolean;
    /**
     * A supplied CryptoKeyPair.
     */
    keys?: CryptoKeyPair;
    /**
     * The base URL as a string of the client.
     */
    baseUrl?: string;
};
export type APISiteWhitelistItem = {
    apiSite: string;
    sampleRate: number;
};
export type APISiteExemptlistItem = {
    apiSite: string;
};
export type TokenMetadata = {
    isSecureAuthenticationIntentEnabled: boolean;
    isBoundAuthTokenEnabledForAllUrls: boolean;
    boundAuthTokenWhitelist?: APISiteWhitelistItem[];
    boundAuthTokenExemptlist?: APISiteExemptlistItem[];
    hbaIndexedDbName: string;
    hbaIndexedDbObjStoreName: string;
    hbaIndexedDbKeyName: string;
    hbaIndexedDbVersion: number;
};
/**
 * Hardware-backed authentication client. This handles generating the headers required.
 */
export declare class HBAClient {
    private readonly _fetchFn?;
    cachedTokenMetadata: TokenMetadata | Promise<TokenMetadata | null> | undefined;
    headers: Record<string, unknown>;
    cryptoKeyPair: CryptoKeyPair | Promise<CryptoKeyPair | null> | undefined;
    onSite: boolean;
    suppliedCryptoKeyPair: CryptoKeyPair | undefined;
    baseUrl: string | undefined;
    /**
     * General fetch wrapper for the client. Not for general public use.
     * @param url - The target URL
     * @param params - The request parameters
     */
    fetch(url: string, params?: RequestInit): Promise<Response>;
    /**
     * Generate the base headers required, it may be empty or only include `x-bound-auth-token`
     * @param requestUrl - The target request URL, will be checked if it's supported for HBA.
     * @param body - The request body. If the method does not support a body, leave it undefined.
     */
    generateBaseHeaders(requestUrl: string | URL, body?: unknown): Promise<Record<string, string>>;
    /**
     * Get HBA token metadata.
     * @param uncached - Whether it should fetch uncached.
     */
    getTokenMetadata(uncached?: boolean): Promise<TokenMetadata | null>;
    /**
     * Fetch the public-private crypto key pair from the indexed DB store.
     * @param uncached - Whether it should fetch uncached.
     */
    getCryptoKeyPair(uncached?: boolean): Promise<CryptoKeyPair | null>;
    /**
     * Generate the bound auth token given a body.
     * @param body - The request body. If the method does not support a body, leave it undefined.
     */
    generateBAT(body?: unknown): Promise<string | null>;
    /**
     * Check whether the URL is supported for bound auth tokens.
     * @param url - The target URL.
     */
    isUrlIncludedInWhitelist(tryUrl: string | URL): Promise<boolean | undefined>;
    constructor({ fetch, headers, onSite, keys, baseUrl, }?: HBAClientConstProps);
}
