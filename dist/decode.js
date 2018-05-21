"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var type_map_1 = require("./type-map");
var inspect = require("util").inspect.custom || "inspect";
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
        case "Buffer":
            res = data;
            break;
        case "Error":
            var stack = data.toString(), matches = stack.match(/(.+): (.+)/), name = matches[1], msg = matches[2];
            res = Object.create(Error.prototype, (_a = {
                    name: { value: name },
                    message: { value: msg },
                    stack: { value: stack }
                },
                _a[inspect] = {
                    value: function () {
                        return this.stack;
                    }
                },
                _a));
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
                var i_1 = data.indexOf(":"), key = data.slice(0, i_1).toString();
                data = data.slice(i_1 + 1);
                var _part = decodePart(getPart(data));
                data = _part.left;
                res[key] = _part.data;
            }
            break;
        case "RegExp":
            var i = data.lastIndexOf("/"), pattern = data.slice(1, i).toString(), flags = data.slice(i + 1).toString();
            res = new RegExp(pattern, flags);
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
    var _a;
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