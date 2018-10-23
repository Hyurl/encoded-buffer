import invert = require("lodash/invert");
import { AssertionError } from "assert";

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

export const isOldNode = parseFloat(process.version.slice(1)) < 6.0;

export const Errors = {
    AssertionError,
    Error,
    EvalError,
    RangeError,
    ReferenceError,
    SyntaxError,
    TypeError
};