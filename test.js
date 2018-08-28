var encode = require("./").encode;
var decode = require("./").decode;
var assert = require("assert");

var buf = parseFloat(process.version.slice(1)) < 6 ? new Buffer("or a buffer") : Buffer.from("or a buffer");
var data = [
    "string",
    12345,
    Symbol("desc"),
    /regexp/,
    ["a", "r", "r", "a", "y"],
    { type: "object" },
    null,
    undefined,
    buf,
    new Error("even an error"),
    new Date()
];

var dataBuf = encode.apply(null, data);

var _data = decode(dataBuf); // decode data

for (var i in _data) {
    var item = _data[i];
    if (typeof item == "string" || typeof item == "number" || item === null || item === undefined) {
        assert.strictEqual(item, data[i]);
    } else if (Array.isArray(item)) {
        assert.deepStrictEqual(item, data[i]);
    } else if (typeof item == "symbol" || Buffer.isBuffer(item) || item instanceof Error || item instanceof Date) {
        assert.strictEqual(item.toString(), data[i].toString());
    } else {
        assert.deepStrictEqual(item, data[i]);
    }
}

console.log("#### OK ####");