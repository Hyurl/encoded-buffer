"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var invert = require("lodash/invert");
var assert_1 = require("assert");
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
exports.isOldNode = parseFloat(process.version.slice(1)) < 6.0;
exports.Errors = {
    AssertionError: assert_1.AssertionError,
    Error: Error,
    EvalError: EvalError,
    RangeError: RangeError,
    ReferenceError: ReferenceError,
    SyntaxError: SyntaxError,
    TypeError: TypeError
};
//# sourceMappingURL=type-map.js.map