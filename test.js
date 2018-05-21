const encode = require("./").encode;
const decode = require("./").decode;
const assert = require("assert");

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
    new Error("even an error")
];

var buf = encode.apply(null, data);

var _data = decode(buf); // decode data

for (var i in _data) {
    var item = _data[i];
    if (typeof item == "string" || typeof item == "number" || item === null || item === undefined) {
        assert.strictEqual(item, data[i]);
    } else if (Array.isArray(item)) {
        assert.deepStrictEqual(item, data[i]);
    } else if (typeof item == "symbol" || Buffer.isBuffer(item) || item instanceof Error) {
        assert.equal(item.toString(), data[i].toString());
    } else {
        assert.deepStrictEqual(item, data[i]);
    }
}

console.log("#### OK ####");