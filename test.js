const { encode, decode } = require("./");
const assert = require("assert");

let data = [
    "string",
    12345,
    Symbol("desc"),
    /regexp/,
    ["a", "r", "r", "a", "y"],
    { type: "object" },
    null,
    undefined,
    Buffer.from("or a buffer"),
    new Error("even an error")
];

let buf = encode(...data);

let _data = decode(buf); // decode data

for (let i in _data) {
    let item = _data[i];
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

console.log("All tests passed!");