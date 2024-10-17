export type HBAClientConstProps = {
    /**
     * The fetch to be used when fetching metadata.
     */
    fetch?: (url: string, params?: RequestInit) => Promise<Response>;
    /**
     * Base request headers for metadata requests.
     */
    headers?: Record<string, unknown> | Headers;
    /**
     * Whether the current context is on the Roblox site, and will use credentials.
     */
    onSite?: boolean;
    /**
     * A supplied CryptoKeyPair that will be used to generate tokens. Must be ECDSA P-256.
     */
    keys?: CryptoKeyPair;
    /**
     * The cookie to use for metadata requests.
     */
    cookie?: string;
    /**
     * HBA url configs.
     */
    urls?: Partial<HBAUrlConfig>;
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
    isAuthenticated: boolean;
};
export type HBAUrlConfig = {
    /**
     * The URL to fetch token metadata from.
     */
    fetchTokenMetadataUrl: string;
    /**
     * A string pattern to check against to see whether it should generate a token.
     */
    matchRobloxBaseUrl: string;
    /**
     * String pattern paths that will be checked against for forced token generation.
     */
    forceBATUrls: string[];
    /**
     * Current URL context.
     */
    currentUrl?: string;
};
/**
 * Hardware-backed authentication client. This handles generating the headers required.
 */
export declare class HBAClient {
    private readonly _fetchFn?;
    cachedTokenMetadata?: TokenMetadata | Promise<TokenMetadata | null>;
    headers: Record<string, unknown>;
    cryptoKeyPair?: CryptoKeyPair | Promise<CryptoKeyPair | null>;
    onSite: boolean;
    suppliedCryptoKeyPair?: CryptoKeyPair;
    cookie?: string;
    isAuthenticated?: Promise<boolean | undefined> | boolean;
    urls: HBAUrlConfig;
    /**
     * General fetch wrapper for the client. Not for general public use.
     * @param url - The target URL
     * @param params - The request parameters
     */
    fetch(url: string, params?: RequestInit): Promise<Response>;
    /**
     * Generate the base headers required, it may be empty or only include `x-bound-auth-token`
     * @param requestUrl - The target request URL, will be checked if it's supported for HBA.
     * @param requestMethod  - The target request method
     * @param body - The request body. If the method does not support a body, leave it undefined.
     */
    generateBaseHeaders(requestUrl: string | URL, requestMethod?: string, includeCredentials?: boolean, body?: unknown): Promise<Record<string, string>>;
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
     * @param requestUrl - The request URL
     * @param requestMethod  - The request method
     * @param body - The request body. If the method does not support a body, leave it undefined.
     */
    generateBAT(requestUrl: string | URL, requestMethod?: string, body?: unknown): Promise<string | null>;
    /**
     * Check whether the URL is supported for bound auth tokens.
     * @param url - The target URL.
     */
    isUrlIncludedInWhitelist(tryUrl: string | URL, includeCredentials?: boolean): Promise<boolean>;
    constructor({ fetch, headers, onSite, keys, urls, cookie, }?: HBAClientConstProps);
}
