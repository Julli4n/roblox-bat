"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterObject = filterObject;
function filterObject(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => (v !== null) && v !== undefined));
}
