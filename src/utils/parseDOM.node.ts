// @ts-nocheck no
export function parseDOM(text: string): Document {
    if ("document" in globalThis && "DOMParser" in globalThis) {
        return new globalThis.DOMParser().parseFromString(text, "text/html");
    }

    return new DOMParser(text).window.document;
}