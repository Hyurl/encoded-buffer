"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const util_1 = require("./util");
const encode_1 = require("./encode");
const toBuffer = require("to-buffer");
function encodePart(data) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let type = util_1.getType(data);
        let key = util_1.TypeKey[type];
        let head, body;
        switch (type) {
            case "Array":
                let start = toBuffer("["), end = toBuffer("]"), bufs = [];
                for (let ele of data) {
                    bufs.push(yield encodePart(ele));
                }
                body = Buffer.concat([start, util_1.concatBuffers(bufs), end]);
                break;
            case "object":
                let start2 = toBuffer("{"), end2 = toBuffer("}"), pairs = [];
                for (let x in data) {
                    if (data.hasOwnProperty(x)) {
                        let keyBuf = yield encodePart(x);
                        let valueBuf = yield encodePart(data[x]);
                        pairs.push(Buffer.concat([keyBuf, toBuffer(";"), valueBuf]));
                    }
                }
                body = Buffer.concat([start2, util_1.concatBuffers(pairs), end2]);
                break;
            default:
                body = encode_1.encodeType(data, type);
                break;
        }
        head = toBuffer(`${key}:${body.byteLength}:`);
        return Buffer.concat([head, body]);
    });
}
function encodeAsync() {
    return tslib_1.__awaiter(this, arguments, void 0, function* () {
        let data = Array.from(arguments);
        let bufs = [];
        for (let part of data) {
            bufs.push(yield encodePart(part));
        }
        return util_1.concatBuffers(bufs);
    });
}
exports.encodeAsync = encodeAsync;
//# sourceMappingURL=encode-async.js.map