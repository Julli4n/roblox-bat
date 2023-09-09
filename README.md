## roblox-bat

Handles `x-bound-auth-token` generation for extensions. Usage for when Roblox's dark launch of HBA
(hardware-backed authentication) BAT (bound auth token) completely rolls out. It has not completely
rolled out yet, but there is a help article on it:
https://en.help.roblox.com/hc/en-us/articles/18765146769812-Account-Session-Protection

### Usage

- GET Requests

```ts
import { HBAClient } from "roblox-bat";

const hbaClient = new HBAClient({
    onSite: true,
});
const headers = await hbaClient.generateBaseHeaders(
    "https://users.roblox.com/v1/users/authenticated",
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
const headers = await hbaClient.generateBaseHeaders(
    "https://catalog.roblox.com/v1/catalog/items/details",
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
