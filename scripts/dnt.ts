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
        version: "0.1.1",
        author: "Julli4n",
        license: "MIT",
    },
    typeCheck: false
});

await copy("./README.md", "./npm/README.md");
await copy("./LICENSE", "./npm/LICENSE");