"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var get_type_1 = require("./get-type");
var type_map_1 = require("./type-map");
var isOldNode = parseFloat(process.version.slice(1)) < 6.0;
function toBuffer(input) {
    return isOldNode ? new Buffer(input) : Buffer.from(input);
}
function concatBuffers(bufs) {
    var res = toBuffer([]), sep = toBuffer(";");
    for (var i in bufs) {
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
    var type = get_type_1.getType(data);
    var key = type_map_1.TypeKey[type];
    var head, body;
    switch (type) {
        case "Array":
            var start = toBuffer("["), end = toBuffer("]"), bufs = [];
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var ele = data_1[_i];
                var buf = encodePart(ele);
                bufs.push(buf);
            }
            body = Buffer.concat([start, concatBuffers(bufs), end]);
            break;
        case "Buffer":
            body = data;
            break;
        case "Error":
            body = toBuffer(data.stack);
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
            var start2 = toBuffer("{"), end2 = toBuffer("}"), pairs = [];
            for (var x in data) {
                if (data.hasOwnProperty(x)) {
                    var keyBuf = toBuffer(x + ":");
                    var valueBuf = encodePart(data[x]);
                    pairs.push(Buffer.concat([keyBuf, valueBuf]));
                }
            }
            body = Buffer.concat([start2, concatBuffers(pairs), end2]);
            break;
        case "string":
            body = toBuffer(data);
            break;
        default:
            body = toBuffer(String(data));
            break;
    }
    head = toBuffer(key + ":" + body.byteLength + ":");
    return Buffer.concat([head, body]);
}
function encode() {
    var data = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        data[_i] = arguments[_i];
    }
    var bufs = [];
    for (var _a = 0, data_2 = data; _a < data_2.length; _a++) {
        var part = data_2[_a];
        bufs.push(encodePart(part));
    }
    return concatBuffers(bufs);
}
exports.encode = encode;
//# sourceMappingURL=encode.js.map