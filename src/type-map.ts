import invert = require("lodash/invert");

export const KeyType = {
    a: "Array",
    b: "Buffer",
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