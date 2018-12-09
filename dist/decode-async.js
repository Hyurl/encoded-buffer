"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const util_1 = require("./util");
const decode_1 = require("./decode");
function decodePart(part) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
                    let _part = yield decodePart(util_1.getPart(data));
                    data = _part.left;
                    res.push(_part.data);
                }
                break;
            case "object":
                res = {};
                while (data.byteLength > 0) {
                    let keyPart = yield decodePart(util_1.getPart(data));
                    let valuePart = yield decodePart(util_1.getPart(keyPart.left));
                    res[keyPart.data] = valuePart.data;
                    data = valuePart.left;
                }
                break;
            default:
                res = decode_1.decode(data)[0];
                break;
        }
        return { type, data: res, left };
    });
}
function decodeAsync(buf) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            let part = yield decodePart(util_1.getPart(buf));
            let res = [part.data];
            let left = part.left;
            while (left.byteLength > 0) {
                let _part = yield decodePart(util_1.getPart(left));
                res.push(_part.data);
                left = _part.left;
            }
            return res;
        }
        catch (err) {
            return null;
        }
    });
}
exports.decodeAsync = decodeAsync;
//# sourceMappingURL=decode-async.js.map