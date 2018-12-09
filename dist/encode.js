"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const toBuffer = require("to-buffer");
function encodePart(data) {
    let type = util_1.getType(data);
    let key = util_1.TypeKey[type];
    let head, body;
    switch (type) {
        case "Array":
            let start = toBuffer("["), end = toBuffer("]"), bufs = [];
            for (let ele of data) {
                let buf = encodePart(ele);
                bufs.push(buf);
            }
            body = Buffer.concat([start, util_1.concatBuffers(bufs), end]);
            break;
        case "boolean":
            body = toBuffer(data ? "1" : []);
            break;
        case "Buffer":
            body = data;
            break;
        case "Date":
            body = toBuffer(data.toISOString());
            break;
        case "Error":
            let err = {
                name: data.name,
                message: data.message,
                stack: data.stack
            };
            for (let x in data) {
                if (x != "name" && x != "message" && x != "stack") {
                    err[x] = data[x];
                }
            }
            body = encodePart(err);
            break;
        case "number":
        case "RegExp":
        case "symbol":
            body = toBuffer(data.toString());
            break;
        case "function":
        case "undefined":
        case "void":
            body = toBuffer([]);
            break;
        case "object":
            let start2 = toBuffer("{"), end2 = toBuffer("}"), pairs = [];
            for (let x in data) {
                if (data.hasOwnProperty(x)) {
                    let keyBuf = encodePart(x);
                    let valueBuf = encodePart(data[x]);
                    pairs.push(Buffer.concat([keyBuf, toBuffer(";"), valueBuf]));
                }
            }
            body = Buffer.concat([start2, util_1.concatBuffers(pairs), end2]);
            break;
        case "string":
            body = toBuffer(JSON.stringify(data).slice(1, -1));
            break;
        default:
            body = toBuffer(String(data));
            break;
    }
    head = toBuffer(`${key}:${body.byteLength}:`);
    return Buffer.concat([head, body]);
}
function encode() {
    let data = Array.from(arguments);
    let bufs = [];
    for (let part of data) {
        bufs.push(encodePart(part));
    }
    return util_1.concatBuffers(bufs);
}
exports.encode = encode;
//# sourceMappingURL=encode.js.map