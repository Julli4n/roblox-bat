import {
    AUTH_TOKEN_SEPARATOR,
    decodeEntities,
    DEFAULT_FETCH_TOKEN_METADATA_URL,
    DEFAULT_FORCE_BAT_URLS,
    DEFAULT_INDEXED_DB_VERSION,
    DEFAULT_MATCH_ROBLOX_URL_BASE,
    FETCH_TOKEN_METADATA_REGEX,
    FETCH_TOKEN_METADATA_SELECTOR,
    FETCH_USER_DATA_REGEX,
    FETCH_USER_DATA_SELECTOR,
    TOKEN_HEADER_NAME,
} from "./utils/constants.ts";
import { getCryptoKeyPairFromDB, hashStringSha256, signWithKey } from "./utils/crypto.ts";
import { filterObject } from "./utils/filterObject.ts";

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
export class HBAClient {
    private readonly _fetchFn?: (url: string, params?: RequestInit) => Promise<Response>;
    public cachedTokenMetadata?: TokenMetadata | Promise<TokenMetadata | null>;
    public headers: Record<string, unknown> = {};
    public cryptoKeyPair?: CryptoKeyPair | Promise<CryptoKeyPair | null>;
    public onSite = false;
    public suppliedCryptoKeyPair?: CryptoKeyPair;
    public cookie?: string;
    public isAuthenticated?: Promise<boolean | undefined> | boolean;
    public urls: HBAUrlConfig = {
        fetchTokenMetadataUrl: DEFAULT_FETCH_TOKEN_METADATA_URL,
        matchRobloxBaseUrl: DEFAULT_MATCH_ROBLOX_URL_BASE,
        forceBATUrls: DEFAULT_FORCE_BAT_URLS,
    };

    /**
     * General fetch wrapper for the client. Not for general public use.
     * @param url - The target URL
     * @param params - The request parameters
     */
    public fetch(url: string, params?: RequestInit): Promise<Response> {
        const headers = new Headers(filterObject(this.headers) as Record<string, string>);
        if (params?.headers) {
            const headerParams = new Headers(params.headers);
            for (const [key, value] of headerParams) {
                headers.set(key, value);
            }
        }
        if (this.cookie) {
            headers.set("cookie", this.cookie);
        }

        const init = {
            ...params,
            headers,
        };
        if (this.onSite) {
            // @ts-ignore: just incase ts is annoying
            init.credentials = "include";
        }
        return (this._fetchFn ?? fetch)(url, init);
    }

    /**
     * Generate the base headers required, it may be empty or only include `x-bound-auth-token`
     * @param requestUrl - The target request URL, will be checked if it's supported for HBA.
     * @param body - The request body. If the method does not support a body, leave it undefined.
     */
    public async generateBaseHeaders(
        requestUrl: string | URL,
        requestMethod: string,
        includeCredentials?: boolean,
        body?: unknown,
    ): Promise<Record<string, string>> {
        if (!await this.isUrlIncludedInWhitelist(requestUrl, includeCredentials)) {
            return {};
        }
        const token = await this.generateBAT(requestUrl.toString(), requestMethod, body);
        if (!token) {
            return {};
        }

        return {
            [TOKEN_HEADER_NAME]: token,
        };
    }

    /**
     * Get HBA token metadata.
     * @param uncached - Whether it should fetch uncached.
     */
    public async getTokenMetadata(uncached?: boolean): Promise<TokenMetadata | null> {
        if (!uncached && await this.cachedTokenMetadata) {
            return this.cachedTokenMetadata!;
        }

        const promise = (async (): Promise<TokenMetadata | null> => {
            let isSecureAuthenticationIntentEnabled: boolean;
            let isBoundAuthTokenEnabledForAllUrls: boolean;
            let boundAuthTokenWhitelist: TokenMetadata["boundAuthTokenWhitelist"];
            let boundAuthTokenExemptlist: TokenMetadata["boundAuthTokenExemptlist"];
            let hbaIndexedDbName: string;
            let hbaIndexedDbObjStoreName: string;
            let hbaIndexedDbKeyName: string;
            let hbaIndexedDbVersion: number;
            let isAuthenticated: boolean;

            let doc: Document | undefined;
            const canUseDoc = "DOMParser" in globalThis && "document" in globalThis;
            if (
                uncached || !canUseDoc ||
                !document.querySelector?.(FETCH_TOKEN_METADATA_SELECTOR) ||
                (!document.querySelector?.(FETCH_USER_DATA_SELECTOR) &&
                    document?.readyState === "loading")
            ) {
                const text = await this.fetch(this.urls.fetchTokenMetadataUrl).then((res) =>
                    res.text()
                );
                if (
                    !canUseDoc
                ) {
                    const match = text.match(FETCH_TOKEN_METADATA_REGEX);
                    if (!match) {
                        return null;
                    }

                    try {
                        isAuthenticated = FETCH_USER_DATA_REGEX.test(text);
                        isSecureAuthenticationIntentEnabled = match[2] === "true";
                        isBoundAuthTokenEnabledForAllUrls = match[4] === "true";
                        try {
                            boundAuthTokenWhitelist = JSON.parse(decodeEntities(match[6]))
                                ?.Whitelist
                                ?.map((item: {
                                    sampleRate: string;
                                }) => ({
                                    ...item,
                                    sampleRate: Number(item.sampleRate),
                                }));
                        } catch {
                            boundAuthTokenWhitelist = [];
                        }
                        try {
                            boundAuthTokenExemptlist = JSON.parse(decodeEntities(match[8]))
                                ?.Exemptlist;
                        } catch {
                            boundAuthTokenExemptlist = [];
                        }
                        hbaIndexedDbName = match[10];
                        hbaIndexedDbObjStoreName = match[12];
                        hbaIndexedDbKeyName = match[14];
                        hbaIndexedDbVersion = parseInt(match[16], 10) || DEFAULT_INDEXED_DB_VERSION;
                    } catch {
                        this.cachedTokenMetadata = undefined;
                        return null;
                    }
                } else {
                    doc = new DOMParser().parseFromString(text, "text/html");
                }
            } else {
                doc = document;
            }

            if (doc) {
                const el = doc.querySelector?.(FETCH_TOKEN_METADATA_SELECTOR);
                if (!el) {
                    return null;
                }
                try {
                    isAuthenticated = !!doc.querySelector?.(FETCH_USER_DATA_SELECTOR);
                    isSecureAuthenticationIntentEnabled =
                        el.getAttribute("data-is-secure-authentication-intent-enabled") === "true";
                    isBoundAuthTokenEnabledForAllUrls =
                        el.getAttribute("data-is-bound-auth-token-enabled") === "true";
                    try {
                        boundAuthTokenWhitelist = JSON.parse(
                            el.getAttribute("data-bound-auth-token-whitelist")!,
                        )?.Whitelist?.map((item: {
                            sampleRate: string;
                        }) => ({
                            ...item,
                            sampleRate: Number(item.sampleRate),
                        }));
                    } catch {
                        boundAuthTokenWhitelist = [];
                    }
                    try {
                        boundAuthTokenExemptlist = JSON.parse(
                            el.getAttribute("data-bound-auth-token-exemptlist")!,
                        )?.Exemptlist;
                    } catch {
                        boundAuthTokenExemptlist = [];
                    }
                    hbaIndexedDbName = el.getAttribute("data-hba-indexed-db-name")!;
                    hbaIndexedDbObjStoreName = el.getAttribute(
                        "data-hba-indexed-db-obj-store-name",
                    )!;
                    hbaIndexedDbKeyName = el.getAttribute("data-hba-indexed-db-key-name")!;
                    hbaIndexedDbVersion =
                        parseInt(el.getAttribute("data-hba-indexed-db-version")!, 10) ||
                        DEFAULT_INDEXED_DB_VERSION;
                } catch {
                    this.cachedTokenMetadata = undefined;
                    return null;
                }
            }

            const tokenMetadata = {
                isSecureAuthenticationIntentEnabled: isSecureAuthenticationIntentEnabled!,
                isBoundAuthTokenEnabledForAllUrls: isBoundAuthTokenEnabledForAllUrls!,
                boundAuthTokenWhitelist: boundAuthTokenWhitelist,
                boundAuthTokenExemptlist: boundAuthTokenExemptlist!,
                hbaIndexedDbName: hbaIndexedDbName!,
                hbaIndexedDbObjStoreName: hbaIndexedDbObjStoreName!,
                hbaIndexedDbKeyName: hbaIndexedDbKeyName!,
                hbaIndexedDbVersion: hbaIndexedDbVersion!,
                isAuthenticated: isAuthenticated!,
            };
            this.cachedTokenMetadata = tokenMetadata;

            return tokenMetadata;
        })();

        this.cachedTokenMetadata = promise;
        return promise;
    }

    /**
     * Fetch the public-private crypto key pair from the indexed DB store.
     * @param uncached - Whether it should fetch uncached.
     */
    public async getCryptoKeyPair(uncached?: boolean): Promise<CryptoKeyPair | null> {
        if (this.suppliedCryptoKeyPair) {
            return this.suppliedCryptoKeyPair;
        }
        if (!uncached && await this.cryptoKeyPair) {
            return this.cryptoKeyPair!;
        }
        if (!("indexedDB" in globalThis)) {
            return null;
        }

        const promise = (async (): Promise<CryptoKeyPair | null> => {
            const metadata = await this.getTokenMetadata(uncached);
            if (!metadata) {
                return null;
            }

            try {
                const pair = await getCryptoKeyPairFromDB(
                    metadata.hbaIndexedDbName,
                    metadata.hbaIndexedDbObjStoreName,
                    metadata.hbaIndexedDbKeyName,
                );
                this.cryptoKeyPair = pair ?? undefined;

                return pair;
            } catch {
                this.cryptoKeyPair = undefined;
                return null;
            }
        })();
        this.cryptoKeyPair = promise;

        return promise;
    }

    /**
     * Generate the bound auth token given a body.
     * @param body - The request body. If the method does not support a body, leave it undefined.
     */
    public async generateBAT(
        requestUrl: string,
        requestMethod: string,
        body?: unknown,
    ): Promise<string | null> {
        const pair = await this.getCryptoKeyPair();
        if (!pair?.privateKey) {
            return null;
        }
        const timestamp = Math.floor(Date.now() / 1000).toString();
        let strBody: string | undefined;
        if (typeof body === "object") {
            strBody = JSON.stringify(body);
        } else if (typeof body === "string") {
            strBody = body;
        }

        const hashedBody = await hashStringSha256(strBody);
        const payloadToSign = [hashedBody, timestamp, requestUrl, requestMethod.toUpperCase()].join(
            AUTH_TOKEN_SEPARATOR,
        );
        const signature = await signWithKey(pair.privateKey, payloadToSign);

        return [hashedBody, timestamp, signature].join(AUTH_TOKEN_SEPARATOR);
    }

    /**
     * Check whether the URL is supported for bound auth tokens.
     * @param url - The target URL.
     */
    public async isUrlIncludedInWhitelist(
        tryUrl: string | URL,
        includeCredentials?: boolean,
    ): Promise<boolean> {
        const url = tryUrl.toString();
        if (!url.toString().includes(this.urls.matchRobloxBaseUrl)) {
            return false;
        }
        if (this.onSite && this.urls.currentUrl) {
            try {
                const targetUrl = new URL(url, this.urls.currentUrl);
                if (!targetUrl.href.includes(this.urls.matchRobloxBaseUrl)) {
                    return false;
                }
            } catch { /* empty */ }
        }

        if (this.urls.forceBATUrls.some((url2) => url.includes(url2))) {
            return true;
        }
        const metadata = await this.getTokenMetadata();
        if ((!includeCredentials || !(metadata?.isAuthenticated || this.isAuthenticated))) {
            return false;
        }

        return !!metadata && (
            metadata.isBoundAuthTokenEnabledForAllUrls ||
            !!metadata.boundAuthTokenWhitelist?.some((item) =>
                url.includes(item.apiSite) && (Math.floor(Math.random() * 100) < item.sampleRate)
            )
        ) &&
            !metadata.boundAuthTokenExemptlist?.some((item) => url.includes(item.apiSite));
    }

    public constructor({
        fetch,
        headers,
        onSite,
        keys,
        urls,
        cookie,
    }: HBAClientConstProps = {}) {
        if (fetch) {
            this._fetchFn = fetch;
        }
        if (headers) {
            // @ts-ignore: fine
            this.headers = headers instanceof Headers
                ? Object.fromEntries(headers.entries())
                : headers;
        }

        if (urls) {
            for (const key in urls) {
                // @ts-ignore: Fine. Type assertions are annoying.
                this.urls[key] = urls[key];
            }
        }

        if (onSite) {
            this.onSite = onSite;
            if (globalThis?.location?.href && !urls?.currentUrl) {
                this.urls.currentUrl = globalThis.location.href;
            }
        }

        if (keys) {
            this.suppliedCryptoKeyPair = keys;
        }

        if (cookie) {
            this.cookie = cookie;
        }
    }
}
