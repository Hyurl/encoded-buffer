"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const get_type_1 = require("./get-type");
const type_map_1 = require("./type-map");
function concatBuffers(bufs) {
    let res = Buffer.from([]), sep = Buffer.from(";");
    for (let i in bufs) {
        if (i == 0) {
            res = Buffer.concat([res, bufs[i]]);
        }
        else {
            res = Buffer.concat([res, sep, bufs[i]]);
        }
    }
    return res;
}
function encodePart(data) {
    let type = get_type_1.getType(data);
    let key = type_map_1.TypeKey[type];
    let head, body;
    switch (type) {
        case "Array":
            let start = Buffer.from("["), end = Buffer.from("]"), bufs = [];
            for (let ele of data) {
                let buf = encodePart(ele);
                bufs.push(buf);
            }
            body = Buffer.concat([start, concatBuffers(bufs), end]);
            break;
        case "Buffer":
            body = data;
            break;
        case "Error":
            body = Buffer.from(data.stack);
            break;
        case "number":
        case "RegExp":
        case "symbol":
            body = Buffer.from(data.toString());
            break;
        case "function":
        case "undefined":
        case "void":
            body = Buffer.from([]);
            break;
        case "object":
            let start2 = Buffer.from("{"), end2 = Buffer.from("}"), pairs = [];
            for (let x in data) {
                if (data.hasOwnProperty(x)) {
                    let keyBuf = Buffer.from(`${x}:`);
                    let valueBuf = encodePart(data[x]);
                    pairs.push(Buffer.concat([keyBuf, valueBuf]));
                }
            }
            body = Buffer.concat([start2, concatBuffers(pairs), end2]);
            break;
        case "string":
            body = Buffer.from(data);
            break;
        default:
            body = Buffer.from(String(data));
            break;
    }
    head = Buffer.from(`${key}:${body.byteLength}:`);
    return Buffer.concat([head, body]);
}
function encode(...data) {
    let bufs = [];
    for (let part of data) {
        bufs.push(encodePart(part));
    }
    return concatBuffers(bufs);
}
exports.encode = encode;
//# sourceMappingURL=encode.js.map