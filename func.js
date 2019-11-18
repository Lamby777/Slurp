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
		global[a] = b;
	}},
	{name: "log", f: (a) => {
		out(a);
	}},
	{name: "local", f: (a) => {
		global[a] = null;
	}},
];

// Var scope
const global = [
	{name: "dummy", value: "6"}
];

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
			let oplen = op.f.length;
			let spaced = code[line].split(/\s/g);
			if (code[line].includes(op.name)) {
				// Time for an operation!
				for (kwn = spaced.length-1;kwn>=0;kwn--) {
					if (oplen == 1) {
						kwargs = spaced.slice(kwn-1, kwn+oplen);
						if (kwargs[oplen-1] == op.name) {
							spaced.splice(kwn-1, oplen+1, op.f(kwargs[1]));
						}
					} else {
						kwargs = spaced.slice(kwn-1, kwn+oplen);
						if (kwargs[oplen-1] == op.name) {
							spaced.splice(kwn-1, oplen+1, op.f(kwargs[0],kwargs.slice(2,kwargs[oplen])));
						}
					}
				}
				code[line] = spaced.join(" ");
			}
		}
	}
	let lexRes = code.join("\n");
	out(lexRes);
	return lexRes;
}

class Val {
	constructor (v, parent) {
		this.val = v;
		this.parent = parent;
	}
}

class Num extends Val {
	constructor (n) {
		this.len = Math.ceil(Math.log10(n + 1));;
		this.even = !(n % 2);
		this.odd = !this.even;
	}
}

module.exports = {
	eval: evalFunc,
	removeComments: removeComments,
	lex: lex,
	toss: toss,
	out: out,
}