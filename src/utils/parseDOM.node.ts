// @ts-nocheck no
export function parseDOM(text: string): Document {
    return new DOMParser(text).window.document;
}