import { getType, concatBuffers, TypeKey } from "./util";
import { encode } from "./encode";
import toBuffer = require("to-buffer");

/** Encodes every part of the data. */
async function encodePart(data: any): Promise<Buffer> {
    let type = getType(data);
    let key: string = TypeKey[type];
    let head: Buffer, body: Buffer;

    switch (type) {
        case "Array": // cyclically encode every element in the array.
            let start = toBuffer("["), // arrays are enwrapped in [].
                end = toBuffer("]"),
                bufs: Buffer[] = [];

            for (let ele of data) {
                bufs.push(await encodePart(ele));
            }

            body = Buffer.concat([start, concatBuffers(bufs), end]);
            break;

        case "object": // cyclically encode every property in the object.
            let start2 = toBuffer("{"), // objects are enwrapped in { }.
                end2 = toBuffer("}"),
                pairs: Buffer[] = [];

            for (let x in data) {
                if ((<object>data).hasOwnProperty(x)) {
                    let keyBuf = await encodePart(x);
                    let valueBuf = await encodePart(data[x]);
                    pairs.push(Buffer.concat([keyBuf, toBuffer(";"), valueBuf]));
                }
            }

            body = Buffer.concat([start2, concatBuffers(pairs), end2]);
            break;

        default:
            body = encode(data);
            break;
    }

    head = toBuffer(`${key}:${body.byteLength}:`);

    return Buffer.concat([head, body]);
}

/** Encodes the given data into a well-formatted buffer. */
export async function encodeAsync(...data: any[]): Promise<Buffer>;
export async function encodeAsync() {
    let data = Array.from(arguments);
    let bufs: Buffer[] = [];

    for (let part of data) {
        bufs.push(await encodePart(part));
    }

    return concatBuffers(bufs);
}