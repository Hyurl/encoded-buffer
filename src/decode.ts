import { KeyType } from "./type-map";
const inspect = require("util").inspect.custom || "inspect";

type DataPart = {
    type: string;
    data: any;
    left: Buffer;
};

/** Throws error is the buffer cannot be decoded. */
function throwError() {
    throw new TypeError("The buffer cannot be decoded.");
}

/** Gets the first encoded part of the buffer. */
function getPart(buf: Buffer): DataPart {
    if (buf[1] !== 58) throwError(); // 58 == :

    let type = String.fromCharCode(buf[0]);
    if (KeyType[type] === undefined) throwError();
    type = KeyType[type];

    let i = buf.indexOf(":", 2);
    if (i <= 2) throwError();

    let lenStr: string = buf.slice(2, i).toString();
    if (isNaN(<any>lenStr)) throwError();
    let len: number = parseInt(lenStr);

    let start: number = i + 1,
        end: number = start + len,
        data = buf.slice(start, end);

    return { type, data, left: buf.slice(end + 1) };
}

/** Decodes every part of the buffer. */
function decodePart(part: DataPart): DataPart {
    let res: any;
    let { type, left } = part;
    let data: Buffer = part.data;

    if (type == "Array" || type == "object")
        data = data.slice(1, -1); // remove [ ] or { }.

    switch (type) {
        case "Array": // cyclically decode every element in the array.
            res = [];
            while (data.byteLength > 0) {
                let _part = decodePart(getPart(data));
                data = _part.left;
                (<any[]>res).push(_part.data);
            }
            break;

        case "boolean":
            res = data.length ? true : false;
            break;

        case "Buffer":
            res = data;
            break;

        case "Date": // rebuild the Date instance.
            res = new Date(data.toString());
            break;

        case "Error": // rebuild the Error instance.
            let stack = data.toString(),
                matches = stack.match(/(.+): (.+)/),
                name = matches[1],
                msg = matches[2];

            res = Object.create(Error.prototype, {
                name: { value: name },
                message: { value: msg },
                stack: { value: stack },
                [inspect]: {
                    value: function () {
                        return this.stack;
                    }
                }
            });
            break;

        case "undefined":
            res = undefined;
            break;

        case "function": // functions cannot be encoded.
        case "void":
            res = null;
            break;

        case "number":
            res = parseFloat(data.toString());
            break;

        case "object": // cyclically decode every element in the array.
            res = {};
            while (data.byteLength > 0) {
                let keyPart = decodePart(getPart(data));
                let valuePart = decodePart(getPart(keyPart.left));
                res[keyPart.data] = valuePart.data;
                data = valuePart.left;
            }
            break;

        case "RegExp": // rebuild the RegExp instance.
            let i = data.lastIndexOf("/"),
                pattern = data.slice(1, i).toString(),
                flags = data.slice(i + 1).toString();

            res = new RegExp(pattern, flags);
            break;

        case "symbol": // rebuild the symbol.
            let desc = data.toString().match(/\((.*)\)/)[1];
            res = Symbol(desc);
            break;

        default: // transform strings and unknown types.
            res = data.toString();
            break;
    }

    return { type, data: res, left };
}

/**
 * Decodes a buffer that is formatted by `encode()`.
 * @returns If failed, `null` will be returned.
 */
export function decode(buf: Buffer): any[] {
    try {
        let part = decodePart(getPart(buf)); // decode the first part.
        let res: any[] = [part.data];
        let { left } = part;

        while (left.byteLength > 0) { // decode every part cyclically.
            let _part = decodePart(getPart(left));
            res.push(_part.data);
            left = _part.left;
        }

        return res;
    } catch (err) {
        return null;
    }
}