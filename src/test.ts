import { HBAClient } from "../mod.ts";

const hbaClient = new HBAClient({
    keys: await crypto.subtle.generateKey(
        {
            name: "ECDSA",
            namedCurve: "P-256",
        },
        false,
        ["sign"],
    ),
});

console.log(
    await hbaClient.generateBaseHeaders("https://apis.roblox.com/captcha/v1/metadata", true),
);
