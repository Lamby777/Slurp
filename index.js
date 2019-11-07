/*

--------------------
| ~Slurp~          |
| Version d6       |
| By DexieTheSheep |
| Nov 6, 2019      |
--------------------

*/

const files = require("fs"); // file reading
const eval = require("safe-eval");
const fn = require("./func"); // grammar, io, and other

let read = files.createReadStream("code.dx", "utf8");
read.on("data", (ch) => {
	fn.out(fn.lex(ch));
});
read.on("end", () => {
	console.log("|EOF|");
	read.close();
});