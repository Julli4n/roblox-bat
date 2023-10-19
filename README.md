## roblox-bat

Handles `x-bound-auth-token` generation for extensions. The dark launch has fully rolled out, but it has not been enforced on the backend as of 4th October, 2023.

## What is `x-bound-auth-token`
A token generated by the client based on request body and epoch timestamp to give to the server in the headers to "verify itself". The crypto key pair is stored in an Indexed DB and is used to sign further requests. The crypto key is generated on authentication (login, signup), it is per-session and is used as hardware-backed authentication.

In the future, Roblox may completely enforce all requests to include it, thus breaking extensions and scripts. There is an article on this feature: https://en.help.roblox.com/hc/en-us/articles/18765146769812-Account-Session-Protection, it also details on how to disable it. However, for extensions, asking the user to disable session protection is not feasible.

## How it Works
* On the first request, it will fetch metadata from `https://www.roblox.com/reference/blank` in the `meta[name="hardware-backed-authentication-data"]` element. 
* Any requests to generate a token will check if the URL is supported, and then grab a private key from the Indexed DB `hbaStore` in the `hbaObjectStore` with the key of the user's browser tracker ID (browserid in RBXEventTrackerV2 key) to sign the request. The final `x-bound-auth-token` key should be formatted like: `sha256ofrequestbody|timestamp|signatureoffirst2`.
* If the URL is supported and it could find a key, `generateBaseHeaders` will return `{"x-bound-auth-token": string}`, otherwise `{}`


### Usage

- GET Requests

```ts
import { HBAClient } from "roblox-bat";

const hbaClient = new HBAClient({
    onSite: true,
});
// {"x-bound-auth-token": string}
const headers = await hbaClient.generateBaseHeaders(
    "https://users.roblox.com/v1/users/authenticated",
    true, // set to false or undefined if not authenticated
);

await fetch("https://users.roblox.com/v1/users/authenticated", {
    headers,
    credentials: "include",
});
```

- POST Requests

```ts
import { HBAClient } from "roblox-bat";

const hbaClient = new HBAClient({
    onSite: true,
});
const body = JSON.stringify({
    items: [
        {
            itemType: "Asset",
            id: 1028593,
        },
    ],
});
// {"x-bound-auth-token": string}
const headers = await hbaClient.generateBaseHeaders(
    "https://catalog.roblox.com/v1/catalog/items/details",
    true, // set to false or undefined if not authenticated
    body,
);

await fetch("https://catalog.roblox.com/v1/catalog/items/details", {
    method: "POST",
    headers: {
        ...headers,
        "content-type": "application/json",
    },
    body,
    credentials: "include",
});
```
