import { getType } from "./get-type";
import { TypeKey } from "./type-map";

const isOldNode = parseFloat(process.version.slice(1)) < 6.0;

function toBuffer(input: any): Buffer {
    return isOldNode ? new Buffer(input) : Buffer.from(input);
}

/** Concatenates buffers, adds ';' between each buffer. . */
function concatBuffers(bufs: Buffer[]): Buffer {
    let res: Buffer = toBuffer([]),
        sep: Buffer = toBuffer(";");

    for (let i in bufs) {
        if (<any>i == 0) {
            res = Buffer.concat([res, bufs[i]]);
        } else {
            res = Buffer.concat([res, sep, bufs[i]]);
        }
    }

    return res;
}

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

        case "Buffer":
            body = data;
            break;

        case "Error": // encode the error stack.
            body = toBuffer((<Error>data).stack);
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
                    let keyBuf = toBuffer(`${x}:`);
                    let valueBuf = encodePart(data[x]);
                    pairs.push(Buffer.concat([keyBuf, valueBuf]));
                }
            }

            body = Buffer.concat([start2, concatBuffers(pairs), end2]);
            break;

        case "string":
            body = toBuffer(<string>data);
            break;

        default: // transform unknown types.
            body = toBuffer(String(data));
            break;
    }

    head = toBuffer(`${key}:${body.byteLength}:`);

    return Buffer.concat([head, body]);
}

/** Encodes the given data into a well-formatted buffer. */
export function encode(...data: any[]): Buffer {
    let bufs: Buffer[] = [];

    for (let part of data) {
        bufs.push(encodePart(part));
    }

    return concatBuffers(bufs);
}