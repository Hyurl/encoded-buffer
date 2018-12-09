"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
function decodeType(data, type) {
    let res;
    switch (type) {
        case "boolean":
            res = data.length ? true : false;
            break;
        case "Buffer":
            res = data;
            break;
        case "Date":
            res = new Date(data.toString());
            break;
        case "Error":
            let _err = decodePart(util_1.getPart(data)).data, name = _err.name, message = _err.message, stack = _err.stack;
            res = Object.create((util_1.Errors[name] || Error).prototype, {
                name: { configurable: true, writable: true, value: name },
                message: { configurable: true, writable: true, value: message },
                stack: { configurable: true, writable: true, value: stack }
            });
            for (let x in _err) {
                if (x != "name" && x != "message" && x != "stack") {
                    res[x] = _err[x];
                }
            }
            break;
        case "undefined":
            res = undefined;
            break;
        case "function":
        case "void":
            res = null;
            break;
        case "number":
            res = parseFloat(data.toString());
            break;
        case "RegExp":
            let str = data.toString(), i = str.lastIndexOf("/"), pattern = str.slice(1, i), flags = str.slice(i + 1);
            res = new RegExp(pattern, flags);
            break;
        case "string":
            res = JSON.parse('"' + data.toString() + '"');
            break;
        case "symbol":
            let desc = data.toString().match(/\((.*)\)/)[1];
            res = Symbol(desc);
            break;
        default:
            res = data.toString();
            break;
    }
    return res;
}
exports.decodeType = decodeType;
function decodePart(part) {
    let res;
    let type = part.type;
    let left = part.left;
    let data = part.data;
    if (type == "Array" || type == "object")
        data = data.slice(1, -1);
    switch (type) {
        case "Array":
            res = [];
            while (data.byteLength > 0) {
                let _part = decodePart(util_1.getPart(data));
                data = _part.left;
                res.push(_part.data);
            }
            break;
        case "object":
            res = {};
            while (data.byteLength > 0) {
                let keyPart = decodePart(util_1.getPart(data));
                let valuePart = decodePart(util_1.getPart(keyPart.left));
                res[keyPart.data] = valuePart.data;
                data = valuePart.left;
            }
            break;
        default:
            res = decodeType(data, type);
            break;
    }
    return { type, data: res, left };
}
function decode(buf) {
    try {
        let part = decodePart(util_1.getPart(buf));
        let res = [part.data];
        let left = part.left;
        while (left.byteLength > 0) {
            let _part = decodePart(util_1.getPart(left));
            res.push(_part.data);
            left = _part.left;
        }
        return res;
    }
    catch (err) {
        return null;
    }
}
exports.decode = decode;
//# sourceMappingURL=decode.js.map