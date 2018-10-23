"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var type_map_1 = require("./type-map");
function throwError() {
    throw new TypeError("The buffer cannot be decoded.");
}
function getPart(buf) {
    if (buf[1] !== 58)
        throwError();
    var type = String.fromCharCode(buf[0]);
    if (type_map_1.KeyType[type] === undefined)
        throwError();
    type = type_map_1.KeyType[type];
    var i = buf.indexOf(":", 2);
    if (i <= 2)
        throwError();
    var lenStr = buf.slice(2, i).toString();
    if (isNaN(lenStr))
        throwError();
    var len = parseInt(lenStr);
    var start = i + 1, end = start + len, data = buf.slice(start, end);
    return { type: type, data: data, left: buf.slice(end + 1) };
}
function decodePart(part) {
    var res;
    var type = part.type, left = part.left;
    var data = part.data;
    if (type == "Array" || type == "object")
        data = data.slice(1, -1);
    switch (type) {
        case "Array":
            res = [];
            while (data.byteLength > 0) {
                var _part = decodePart(getPart(data));
                data = _part.left;
                res.push(_part.data);
            }
            break;
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
            var _err = decodePart(getPart(data)).data, name = _err.name, message = _err.message, stack = _err.stack;
            res = Object.create((type_map_1.Errors[name] || Error).prototype, {
                name: { configurable: true, writable: true, value: name },
                message: { configurable: true, writable: true, value: message },
                stack: { configurable: true, writable: true, value: stack }
            });
            for (var x in _err) {
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
        case "object":
            res = {};
            while (data.byteLength > 0) {
                var keyPart = decodePart(getPart(data));
                var valuePart = decodePart(getPart(keyPart.left));
                res[keyPart.data] = valuePart.data;
                data = valuePart.left;
            }
            break;
        case "RegExp":
            var _data = type_map_1.isOldNode ? data.toString() : data, i = _data.lastIndexOf("/"), pattern = _data.slice(1, i).toString(), flags = _data.slice(i + 1).toString();
            res = new RegExp(pattern, flags);
            break;
        case "string":
            res = JSON.parse('"' + data.toString() + '"');
            break;
        case "symbol":
            var desc = data.toString().match(/\((.*)\)/)[1];
            res = Symbol(desc);
            break;
        default:
            res = data.toString();
            break;
    }
    return { type: type, data: res, left: left };
}
function decode(buf) {
    try {
        var part = decodePart(getPart(buf));
        var res = [part.data];
        var left = part.left;
        while (left.byteLength > 0) {
            var _part = decodePart(getPart(left));
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