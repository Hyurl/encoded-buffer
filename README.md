# Encoded-Buffer

**Encode data into a well-formatted buffer and decode it when needed.**

## Example

```javascript
const { encode, decode } = require("encoded-buffer");

let buf = encode( // encode data
    "string",
    12345,
    Symbol("desc"),
    /regexp/,
    ["a", "r", "r", "a", "y"],
    {type: "object"},
    null,
    undefined,
    Buffer.from("or a buffer"),
    new Error("even an error"),
    new Date()
    true
);

console.log(buf);
console.log(buf.toString());

let data = decode(buf); // decode data

console.log(data); // decoded data is an array, or null when failed.
```

## Buffer Format

When data is encoded, it will be formatted with a leading character and number
that indicates the original `type` and the `byte length` of the data, and 
every part of the data is separated by `;`. the style would seemed like this:

`s:6:string;n:5:12345;S:12:Symbol(desc);r:8:/regexp/;...`

Array will be enwrapped with `[]`, and objects will be enwrapped with `{}`, 
and they are encoded recursively.

This map shows the representations of supported types:

- `a => Array` arrays will be encoded recursively.
- `b => boolean` booleans are encoded either as 1 or empty buffer.
- `B => Buffer` buffers will keep the original form.
- `d => Date` encode the ISO string, when decode, generate a new instance.
- `e => Error` encode all properties in an object, when decode, generate a new 
    instance according to the name, message, stack and any other properties.
- `f => function` functions cannot be encoded, so treated as `void`.
- `n => number` encoded as string.
- `o => object` objects will be encoded recursively.
- `r => RegExp` encoded as string.
- `s => string` buffered as what it is, special characters like `\r`, `\n`, etc.
    should be escaped.
- `S => symbol` encoded as string, when decode, generate a new symbol.
- `u => undefined` encoded as `0x0`.
- `v => void` for `null`, encoded as `0x0`.

## Purpose

The major purpose of the this module is meant to encode data into a 
well-formatted buffer, so that it could be transferred via the Internet or 
other materials, and decoded automatically by the program.