const comment = "+"; // kinda like // in js
const ops = [
	{name: "ps", f: (a, b) => parseFloat(a)+parseFloat(b)},
	{name: "sb", f: (a, b) => a-b},
	{name: "mt", f: (a, b) => a*b},
	{name: "dv", f: (a, b) => a/b},
	{name: "&", f: (a, b) => parseBool(a) && parseBool(b)},
	{name: "|", f: (a, b) => parseBool(a) || parseBool(b)},
	{name: "~", f: (a) => !parseBool(a)},
	// Import statement
	{name: "im", f: (a) => {
		const files = require("fs"); // file reading
		let read = files.readFileSync(a+".dx", "utf8");
		return evalFunc(read);
	}},
	{name: "is", f: (a, b) => {
		global.a = b;
	}},
];

// Var scope
const global = [];

function evalFunc(code, silent = true) {
	code = lex(code);
	if (!silent) out(code);
	return code;
}

function removeComments(code) {
	for (const line in code) {
		let commentcol = code[line].indexOf(comment);
		if (commentcol != -1) {
			code[line] = code[line].slice(0, commentcol);
		}
		if (!code[line]) code.splice(line, 1);
	} return code;
}

function parseBool(val) {
	if (val == "true") return true;
	else if (val == "false") return false;
	else return !!val;
}

function toss(err, errt) {
	if (errt) console.error(errt + " Error > " + err);
	else console.error("Generic Error > " + err);
}

function out(msg, type) {
	msg = msg.split("\n").join("\n^- ");
	if (type) console.log(type + " > " + msg);
	else console.log("-> " + msg);
}

function lex(code) {
	// Code is a string
	code = code.split(/\n/g);
	code = removeComments(code);
	// Operations
	for (const line in code) {
		for (const op of ops) {
			let spaced = code[line].split(/\s/g);
			if (code[line].includes(op.name)) {
				// Time for an operation!
				for (kwn in spaced.reverse()) {
					if (op.f.length === 2) {
						kwargs = spaced.slice(kwn-1, kwn+2);
						if (kwargs[1] == op.name) {
							spaced.splice(kwn-1, 3, op.f(kwargs[0], kwargs[2]));
						}
						//console.log(spaced);
					} else {
						kwargs = spaced.slice(kwn-1, kwn+1);
						if (kwargs[1] == op.name) {
							spaced.splice(kwn-1, 2, op.f(kwargs[0]));
						}
					}
				}
				code[line] = spaced.join(" ");
			}
		}
	}
	return code.join("\n");
}

module.exports = {
	eval: evalFunc,
	removeComments: removeComments,
	lex: lex,
	toss: toss,
	out: out,
}