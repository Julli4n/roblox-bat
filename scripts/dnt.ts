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
        undici: true,
        crypto: true
    },
    package: {
        name: "roblox-bat",
        version: "0.1.0",
        author: "Julli4n",
        license: "MIT",
    },
});

await copy("./README.md", "./npm/README.md");
await copy("./LICENSE", "./npm/LICENSE");