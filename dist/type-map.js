"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var invert = require("lodash/invert");
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
//# sourceMappingURL=type-map.js.map