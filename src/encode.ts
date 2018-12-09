import { getType, concatBuffers, TypeKey } from "./util";
import toBuffer = require("to-buffer");

/** Encodes every part of the data. */
function encodePart(data: any): Buffer {
    let type = getType(data);
    let key: string = TypeKey[type];
    let head: Buffer, body: Buffer;

    switch (type) {
        case "Array": // cyclically encode every element in the array.
            let start = toBuffer("["), // arrays are enwrapped in [].
                end = toBuffer("]"),
                bufs: Buffer[] = [];

            for (let ele of data) {
                let buf = encodePart(ele);
                bufs.push(buf);
            }

            body = Buffer.concat([start, concatBuffers(bufs), end]);
            break;

        case "boolean":
            body = toBuffer(data ? "1" : [])
            break;

        case "Buffer":
            body = data;
            break;

        case "Date":
            body = toBuffer((<Date>data).toISOString());
            break;

        case "Error": // encode the error stack.
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

        case "function": // functions cannot be encoded.
        case "undefined":
        case "void":
            body = toBuffer([]); // buffered as 0x0.
            break;

        case "object": // cyclically encode every property in the object.
            let start2 = toBuffer("{"), // objects are enwrapped in { }.
                end2 = toBuffer("}"),
                pairs: Buffer[] = [];

            for (let x in data) {
                if ((<object>data).hasOwnProperty(x)) {
                    let keyBuf = encodePart(x);
                    let valueBuf = encodePart(data[x]);
                    pairs.push(Buffer.concat([keyBuf, toBuffer(";"), valueBuf]));
                }
            }

            body = Buffer.concat([start2, concatBuffers(pairs), end2]);
            break;

        case "string":
            body = toBuffer(JSON.stringify(<string>data).slice(1, -1));
            break;

        default: // transform unknown types.
            body = toBuffer(String(data));
            break;
    }

    head = toBuffer(`${key}:${body.byteLength}:`);

    return Buffer.concat([head, body]);
}

/** Encodes the given data into a well-formatted buffer. */
export function encode(...data: any[]): Buffer;
export function encode() {
    let data = Array.from(arguments);
    let bufs: Buffer[] = [];

    for (let part of data) {
        bufs.push(encodePart(part));
    }

    return concatBuffers(bufs);
}