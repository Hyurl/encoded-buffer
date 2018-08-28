"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var invert = require("lodash/invert");
exports.KeyType = {
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
exports.TypeKey = invert(exports.KeyType);
//# sourceMappingURL=type-map.js.map