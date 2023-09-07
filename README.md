## roblox-bat

Handles `x-bound-auth-token` generation for extensions. Usage for when Roblox's dark launch of HBA
(hardware-based authentication) BAT (bound auth token) completely rolls out. It has not completely
rolled out yet, but there is a help article on it:
https://en.help.roblox.com/hc/en-us/articles/18765146769812-Account-Session-Protection

### Usage

```ts
import { HBAClient } from "roblox-bat";

const hbaClient = new HBAClient({
    onSite: true,
});
const headers = await hbaClient.generateBaseHeaders();

await fetch("https://users.roblox.com/v1/users/authenticated", {
    headers,
    credentials: "include",
});
```
