import { copy } from "https://deno.land/std@0.201.0/fs/mod.ts";
import { build } from "https://deno.land/x/dnt@0.38.1/mod.ts";

await build({
    entryPoints: ["./mod.ts"],
    outDir: "./npm",
    compilerOptions: {
        lib: ["ES2021", "DOM"],
    },
    skipSourceOutput: true,
    shims: {},
    package: {
        name: "roblox-bat",
        description: "A Deno/NodeJS module to generate Roblox BAT tokens for extensions",
        version: "0.1.8",
        homepage: "https://github.com/Julli4n/roblox-bat",
        author: "Julli4n",
        bugs: {
            url: "https://github.com/Julli4n/roblox-bat/issues",
        },
        repository: {
            type: "git",
            url: "git@github.com:Julli4n/roblox-bat.git",
        },
        keywords: [
            "roblox",
            "api",
        ],
        license: "MIT",
    },
    typeCheck: false,
});

await copy("./README.md", "./npm/README.md");
await copy("./LICENSE", "./npm/LICENSE");
