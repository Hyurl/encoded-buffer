import invert = require("lodash/invert");
import toBuffer = require("to-buffer");
import { AssertionError } from "assert";

export type DataPart = {
    type: string;
    data: any;
    left: Buffer;
};

export const KeyType = {
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

export const TypeKey = invert(KeyType);

export const Errors = {
    AssertionError,
    Error,
    EvalError,
    RangeError,
    ReferenceError,
    SyntaxError,
    TypeError
};

/** Throws error is the buffer cannot be decoded. */
function throwError() {
    throw new TypeError("The buffer cannot be decoded.");
}

/** Gets the constructor/type name of the given object. */
function type(obj: any): string {
    return (<string>Object.prototype.toString.apply(obj)).slice(8, -1);
}

/** Checks if the given object is a RegExp instance. */
function isRegExp(obj: any): boolean {
    return type(obj) == "RegExp";
}

/** Checks if the given object is an Error instance. */
function isError(obj: any): boolean {
    return type(obj) == "Error";
}

/** Checks if the given object is a Date instance. */
function isDate(obj: any): boolean {
    return type(obj) == "Date";
}

/** Gets the type of the given object. */
export function getType(obj: any): string {
    let type: string;
    if (Buffer.isBuffer(obj)) {
        type = "Buffer";
    } else if (Array.isArray(obj)) {
        type = "Array";
    } else if (obj === null) {
        type = "void";
    } else if (isRegExp(obj)) {
        type = "RegExp";
    } else if (isError(obj)) {
        type = "Error";
    } else if (isDate(obj)) {
        type = "Date";
    } else {
        type = typeof obj;
    }
    return type;
}

/** Concatenates buffers, adds ';' between each buffer. . */
export function concatBuffers(bufs: Buffer[]): Buffer {
    let res: Buffer = toBuffer([]),
        sep: Buffer = toBuffer(";");

    for (let i in bufs) {
        if (<any>i == 0) {
            res = Buffer.concat([res, bufs[i]]);
        } else {
            res = Buffer.concat([res, sep, bufs[i]]);
        }
    }

    return res;
}

/** Gets the first encoded part of the buffer. */
export function getPart(buf: Buffer): DataPart {
    if (buf[1] !== 58) throwError(); // 58 == :

    let type = String.fromCharCode(buf[0]);
    if (KeyType[type] === undefined) throwError();
    type = KeyType[type];

    let i = buf.indexOf(":", 2);
    if (i <= 2) throwError();

    let len = parseInt(buf.slice(2, i).toString());
    if (isNaN(len)) throwError();

    let start: number = i + 1,
        end: number = start + len,
        data = buf.slice(start, end);

    if (data.byteLength < len) throwError();

    return { type, data, left: buf.slice(end + 1) };
}