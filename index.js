/*
-------------------------------------
|            ~Slurp~                |
|         By DexieTheSheep          |
| https://github.com/Lamby777/Slurp |
-------------------------------------
*/

const files = require("fs"); // file reading
const fn = require("./func"); // grammar, io, and other

let read = files.createReadStream("code.dx", "utf8");
read.on("data", (ch) => {
	fn.out(fn.lex(ch));
});
read.on("end", () => {
	console.log("<|EOF|>");
	read.close();
});