import * as dntShim from "../../_dnt.shims.js";
// @ts-nocheck no
export function parseDOM(text) {
    if ("document" in dntShim.dntGlobalThis && "DOMParser" in dntShim.dntGlobalThis) {
        return new dntShim.dntGlobalThis.DOMParser().parseFromString(text, "text/html");
    }
    return new dntShim.DOMParser(text).window.document;
}
