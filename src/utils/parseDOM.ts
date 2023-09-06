export function parseDOM(text: string): Document {
    return new DOMParser().parseFromString(text, "text/html");
}