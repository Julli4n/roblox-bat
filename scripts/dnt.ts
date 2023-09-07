import { build } from "https://deno.land/x/dnt@0.38.1/mod.ts";
import { copy } from "https://deno.land/std@0.201.0/fs/mod.ts";

await build({
    entryPoints: ["./mod.ts"],
    outDir: "./npm",
    compilerOptions: {
        lib: ["ES2021", "DOM"],
    },
    skipSourceOutput: true,
    shims: {
        custom: [{
            package: {
                name: "jsdom",
                version: "22.1.0"
            },
            typesPackage: {
                name: "@types/jsdom",
                version: "21.1.2"
            },
            globalNames: [{
                name: "DOMParser",
                exportName: "JSDOM"
            }]
        }]
    },
    mappings: {
        "./src/utils/parseDOM.ts": "./src/utils/parseDOM.node.ts"
    },
    package: {
        name: "roblox-bat",
        description: "A Deno/NodeJS module to generate Roblox BAT tokens for extensions",
        version: "0.1.1",
        homepage: "https://github.com/Julli4n/roblox-bat",
        author: "Julli4n",
        bugs: {
            url: "https://github.com/Julli4n/roblox-bat/issues"
        },
        repository: {
            type: "git",
            url: "git@github.com:Julli4n/roblox-bat.git"
        },
        keywords: [
            "roblox",
            "api"
        ],
        license: "MIT",
    },
    typeCheck: false
});

await copy("./README.md", "./npm/README.md");
await copy("./LICENSE", "./npm/LICENSE");