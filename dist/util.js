"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const invert = require("lodash/invert");
const toBuffer = require("to-buffer");
const assert_1 = require("assert");
exports.KeyType = {
    a: "Array",
    b: "boolean",
    B: "Buffer",
    d: "Date",
    e: "Error",
    f: "function",
    n: "number",
    o: "object",
    r: "RegExp",
    s: "string",
    S: "symbol",
    u: "undefined",
    v: "void"
};
exports.TypeKey = invert(exports.KeyType);
exports.Errors = {
    AssertionError: assert_1.AssertionError,
    Error,
    EvalError,
    RangeError,
    ReferenceError,
    SyntaxError,
    TypeError
};
function throwError() {
    throw new TypeError("The buffer cannot be decoded.");
}
function type(obj) {
    return Object.prototype.toString.apply(obj).slice(8, -1);
}
function isRegExp(obj) {
    return type(obj) == "RegExp";
}
function isError(obj) {
    return type(obj) == "Error";
}
function isDate(obj) {
    return type(obj) == "Date";
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
    else if (isDate(obj)) {
        type = "Date";
    }
    else {
        type = typeof obj;
    }
    return type;
}
exports.getType = getType;
function concatBuffers(bufs) {
    let res = toBuffer([]), sep = toBuffer(";");
    for (let i in bufs) {
        if (i == 0) {
            res = Buffer.concat([res, bufs[i]]);
        }
        else {
            res = Buffer.concat([res, sep, bufs[i]]);
        }
    }
    return res;
}
exports.concatBuffers = concatBuffers;
function getPart(buf) {
    if (buf[1] !== 58)
        throwError();
    let type = String.fromCharCode(buf[0]);
    if (exports.KeyType[type] === undefined)
        throwError();
    type = exports.KeyType[type];
    let i = buf.indexOf(":", 2);
    if (i <= 2)
        throwError();
    let len = parseInt(buf.slice(2, i).toString());
    if (isNaN(len))
        throwError();
    let start = i + 1, end = start + len, data = buf.slice(start, end);
    if (data.byteLength < len)
        throwError();
    return { type, data, left: buf.slice(end + 1) };
}
exports.getPart = getPart;
//# sourceMappingURL=util.js.map