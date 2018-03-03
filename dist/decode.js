"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorLike_1 = require("./ErrorLike");
const type_map_1 = require("./type-map");
function throwError() {
    throw new TypeError("The buffer cannot be decoded.");
}
function getPart(buf) {
    if (buf[1] !== 58)
        throwError();
    let type = String.fromCharCode(buf[0]);
    if (type_map_1.KeyType[type] === undefined)
        throwError();
    type = type_map_1.KeyType[type];
    let i = buf.indexOf(":", 2);
    if (i <= 2)
        throwError();
    let lenStr = buf.slice(2, i).toString();
    if (isNaN(lenStr))
        throwError();
    let len = parseInt(lenStr);
    let start = i + 1, end = start + len, data = buf.slice(start, end);
    return { type, data, left: buf.slice(end + 1) };
}
function decodePart(part) {
    let res;
    let { type, left } = part;
    let data = part.data;
    if (type == "Array" || type == "object")
        data = data.slice(1, -1);
    switch (type) {
        case "Array":
            res = [];
            while (data.byteLength > 0) {
                let _part = decodePart(getPart(data));
                data = _part.left;
                res.push(_part.data);
            }
            break;
        case "Buffer":
            res = data;
            break;
        case "Error":
            let stack = data.toString(), matches = stack.match(/(.+): (.+)/), name = matches[1], msg = matches[2];
            res = Object.create(ErrorLike_1.ErrorLike.prototype);
            res.name = name;
            res.message = msg;
            res.stack = stack;
            break;
        case "function":
        case "undefined":
            res = undefined;
            break;
        case "void":
            res = null;
            break;
        case "number":
            res = parseFloat(data.toString());
            break;
        case "object":
            res = {};
            while (data.byteLength > 0) {
                let i = data.indexOf(":"), key = data.slice(0, i).toString();
                data = data.slice(i + 1);
                let _part = decodePart(getPart(data));
                data = _part.left;
                res[key] = _part.data;
            }
            break;
        case "RegExp":
            let i = data.lastIndexOf("/"), pattern = data.slice(1, i).toString(), flags = data.slice(i + 1).toString();
            res = new RegExp(pattern, flags);
            break;
        case "symbol":
            let desc = data.toString().match(/\((.*)\)/)[1];
            res = Symbol(desc);
            break;
        default:
            res = data.toString();
            break;
    }
    return { type, data: res, left };
}
function decode(buf) {
    try {
        let part = decodePart(getPart(buf));
        let res = [part.data];
        let { left } = part;
        while (left.byteLength > 0) {
            let _part = decodePart(getPart(left));
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