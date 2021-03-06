import { getPart, DataPart, Errors } from "./util";

export function decodeType(data: Buffer, type: string): any {
    let res;

    switch (type) {
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
            let _err: Error = decodePart(getPart(data)).data,
                name = _err.name,
                message = _err.message,
                stack = _err.stack;

            res = Object.create((Errors[name] || Error).prototype, {
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

        case "function": // functions cannot be encoded.
        case "void":
            res = null;
            break;

        case "number":
            res = parseFloat(data.toString());
            break;

        case "RegExp": // rebuild the RegExp instance.
            let str: string = data.toString(),
                i = str.lastIndexOf("/"),
                pattern = str.slice(1, i),
                flags = str.slice(i + 1);

            res = new RegExp(pattern, flags);
            break;

        case "string":
            res = JSON.parse('"' + data.toString() + '"');
            break;

        case "symbol": // rebuild the symbol.
            let desc = data.toString().match(/\((.*)\)/)[1];
            res = Symbol(desc);
            break;

        default: // transform strings and unknown types.
            res = data.toString();
            break;
    }

    return res;
}

/** Decodes every part of the buffer. */
function decodePart(part: DataPart): DataPart {
    let res: any;
    let type = part.type;
    let left = part.left;
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

        case "object": // cyclically decode every element in the array.
            res = {};
            while (data.byteLength > 0) {
                let keyPart = decodePart(getPart(data));
                let valuePart = decodePart(getPart(keyPart.left));
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

/**
 * Decodes a buffer that is formatted by `encode()`.
 * @returns If failed, `null` will be returned.
 */
export function decode(buf: Buffer): any[] {
    try {
        let part = decodePart(getPart(buf)); // decode the first part.
        let res: any[] = [part.data];
        let left = part.left;

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