import { copy } from "jsr:@std/fs@0.223.0";
import { build } from "jsr:@deno/dnt@0.41.1";

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
        version: "0.4.0",
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
