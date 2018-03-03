const { encode, decode } = require("./");

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
    new Error("even an error")
);

console.log(buf);
console.log(buf.toString());

let data = decode(buf); // decode data

console.log(data);