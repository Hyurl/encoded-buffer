import { DataPart, getPart } from "./util";
import { decode } from "./decode";

/** Decodes every part of the buffer. */
async function decodePart(part: DataPart): Promise<DataPart> {
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
                let _part = await decodePart(getPart(data));
                data = _part.left;
                (<any[]>res).push(_part.data);
            }
            break;

        case "object": // cyclically decode every element in the array.
            res = {};
            while (data.byteLength > 0) {
                let keyPart = await decodePart(getPart(data));
                let valuePart = await decodePart(getPart(keyPart.left));
                res[keyPart.data] = valuePart.data;
                data = valuePart.left;
            }
            break;

        default:
            res = decode(data)[0];
            break;
    }

    return { type, data: res, left };
}

/**
 * Decodes a buffer that is formatted by `encode()`.
 * @returns If failed, `null` will be returned.
 */
export async function decodeAsync(buf: Buffer): Promise<any[]> {
    try {
        let part = await decodePart(getPart(buf)); // decode the first part.
        let res: any[] = [part.data];
        let left = part.left;

        while (left.byteLength > 0) { // decode every part cyclically.
            let _part = await decodePart(getPart(left));
            res.push(_part.data);
            left = _part.left;
        }

        return res;
    } catch (err) {
        return null;
    }
}