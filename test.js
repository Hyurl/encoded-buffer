var encode = require(".").encode;
var decode = require(".").decode;
var assert = require("assert");

var buf = parseFloat(process.version.slice(1)) < 6 ? new Buffer("or a buffer") : Buffer.from("or a buffer");

var err = new TypeError("even an error");
err["code"] = "EUSERERR";

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
    err, //new TypeError("even an error"),
    new Date(),
    true
];

var dataBuf = encode.apply(undefined, data);

var _data = decode(dataBuf); // decode data

assert.ok(_data instanceof Array);

for (var i in _data) {
    var item = _data[i];
    if (typeof item == "string" || typeof item == "number" || typeof item == "boolean" || item === null || item === undefined) {
        assert.strictEqual(item, data[i]);
    } else if (Array.isArray(item)) {
        assert.deepStrictEqual(item, data[i]);
    } else if (typeof item == "symbol" || Buffer.isBuffer(item) || item instanceof Date) {
        assert.strictEqual(item.toString(), data[i].toString());
    } else if (item instanceof Error) {
        assert.strictEqual(item.name, data[i].name);
        assert.strictEqual(item.message, data[i].message);
        assert.strictEqual(item.stack, data[i].stack);

        for (let x in item) {
            if (x != "name" && x != "message" && x != "stack") {
                assert.strictEqual(item[x], data[i][x]);
            }
        }
    } else {
        assert.deepStrictEqual(item, data[i]);
    }
}

console.log("#### OK ####");