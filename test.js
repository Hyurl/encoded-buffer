"use strict";

const encode = require(".").encode;
const decode = require(".").decode;
const encodeAsync = require(".").encodeAsync;
const decodeAsync = require(".").decodeAsync;
const assert = require("assert");
const toBuffer = require("to-buffer");
const awaiter = require("tslib").__awaiter;

describe("encode and decode buffer", () => {
    var buf = toBuffer("or a buffer");
    var err = Object.assign(new TypeError("even an error"), { code: "EUSERERR" });
    var data = [
        "string",
        12345,
        Symbol("desc"),
        /regexp/i,
        ["a", "r", "r", "a", "y"],
        { type: "object" },
        null,
        undefined,
        buf,
        err, //new TypeError("even an error"),
        new Date(),
        true
    ];
    var json = require("./package.json");

    it("should encode data to buffer and decode as expected", () => {
        var dataBuf = encode.apply(undefined, data);
        var _data = decode(dataBuf); // decode data

        assert.ok(_data instanceof Array);

        for (var i in _data) {
            var item = _data[i];
            if (typeof item == "string"
                || typeof item == "number"
                || typeof item == "boolean"
                || item === null
                || item === undefined) {
                assert.strictEqual(item, data[i]);
            } else if (Array.isArray(item)) {
                assert.deepStrictEqual(item, data[i]);
            } else if (typeof item == "symbol"
                || Buffer.isBuffer(item)
                || item instanceof Date) {
                assert.strictEqual(item.toString(), data[i].toString());
            } else if (item instanceof Error) {
                assert.strictEqual(item.name, data[i].name);
                assert.strictEqual(item.message, data[i].message);
                assert.strictEqual(item.stack, data[i].stack);

                for (var x in item) {
                    if (x != "name" && x != "message" && x != "stack") {
                        assert.strictEqual(item[x], data[i][x]);
                    }
                }
            } else {
                assert.deepStrictEqual(item, data[i]);
            }
        }

        assert.deepStrictEqual(decode(encode(json))[0], json);
    });

    it("should asynchronously encode data to buffer and decode as expected", (done) => {
        awaiter(void 0, [], null, function* () {
            try {
                var dataBuf = yield encodeAsync.apply(undefined, data);
                var _data = yield decodeAsync(dataBuf); // decode data

                assert.ok(_data instanceof Array);

                for (var i in _data) {
                    var item = _data[i];
                    if (typeof item == "string"
                        || typeof item == "number"
                        || typeof item == "boolean"
                        || item === null
                        || item === undefined) {
                        assert.strictEqual(item, data[i]);
                    } else if (Array.isArray(item)) {
                        assert.deepStrictEqual(item, data[i]);
                    } else if (typeof item == "symbol"
                        || Buffer.isBuffer(item)
                        || item instanceof Date) {
                        assert.strictEqual(item.toString(), data[i].toString());
                    } else if (item instanceof Error) {
                        assert.strictEqual(item.name, data[i].name);
                        assert.strictEqual(item.message, data[i].message);
                        assert.strictEqual(item.stack, data[i].stack);

                        for (var x in item) {
                            if (x != "name" && x != "message" && x != "stack") {
                                assert.strictEqual(item[x], data[i][x]);
                            }
                        }
                    } else {
                        assert.deepStrictEqual(item, data[i]);
                    }
                }

                var _package = yield encodeAsync(json);
                var __package = yield decodeAsync(_package);

                assert.deepStrictEqual(__package[0], json);

                done();
            } catch (err) {
                done(err);
            }
        });
    });
});