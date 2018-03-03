"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function type(obj) {
    return Object.prototype.toString.apply(obj).slice(8, -1);
}
function isRegExp(obj) {
    return type(obj) == "RegExp";
}
function isError(obj) {
    return type(obj) == "Error";
}
function getType(obj) {
    let type;
    if (Buffer.isBuffer(obj)) {
        type = "Buffer";
    }
    else if (Array.isArray(obj)) {
        type = "Array";
    }
    else if (obj === null) {
        type = "void";
    }
    else if (isRegExp(obj)) {
        type = "RegExp";
    }
    else if (isError(obj)) {
        type = "Error";
    }
    else {
        type = typeof obj;
    }
    return type;
}
exports.getType = getType;
//# sourceMappingURL=get-type.js.map