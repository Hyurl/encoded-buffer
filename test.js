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

assert.equal(buf.toString(), [
    's:6:string;n:5:12345;S:12:Symbol(desc);r:8:/regexp/;a:31:[s:1:a;s:1:r;s:1:r;s:1:a;s:1:y];o:17:{type:s:6:object};v:0:;u:0:;b:11:or a buffer;e:595:Error: even an error',
    `    at Object.<anonymous> (${__filename}:14:5)`,
    '    at Module._compile (internal/modules/cjs/loader.js:654:30)',
    '    at Object.Module._extensions..js (internal/modules/cjs/loader.js:665:10)',
    '    at Module.load (internal/modules/cjs/loader.js:566:32)',
    '    at tryModuleLoad (internal/modules/cjs/loader.js:506:12)',
    '    at Function.Module._load (internal/modules/cjs/loader.js:498:3)',
    '    at Function.Module.runMain (internal/modules/cjs/loader.js:695:10)',
    '    at startup (internal/bootstrap/node.js:201:19)',
    '    at bootstrapNodeJSCore (internal/bootstrap/node.js:516:3)'
].join("\n"));

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