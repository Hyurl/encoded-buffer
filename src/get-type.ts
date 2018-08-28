/** Gets the constructor/type name of the given object. */
function type(obj: any): string {
    return (<string>Object.prototype.toString.apply(obj)).slice(8, -1);
}

/** Checks if the given object is a RegExp instance. */
function isRegExp(obj: any): boolean {
    return type(obj) == "RegExp";
}

/** Checks if the given object is an Error instance. */
function isError(obj: any): boolean {
    return type(obj) == "Error";
}

/** Checks if the given object is a Date instance. */
function isDate(obj: any): boolean {
    return type(obj) == "Date";
}

/** Gets the type of the given object. */
export function getType(obj: any): string {
    let type: string;
    if (Buffer.isBuffer(obj)) {
        type = "Buffer";
    } else if (Array.isArray(obj)) {
        type = "Array";
    } else if (obj === null) {
        type = "void";
    } else if (isRegExp(obj)) {
        type = "RegExp";
    } else if (isError(obj)) {
        type = "Error";
    } else if (isDate(obj)) {
        type = "Date";
    } else {
        type = typeof obj;
    }
    return type;
}