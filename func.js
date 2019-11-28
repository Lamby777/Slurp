const fs = require("fs"); // file reading
const comment = "+"; // kinda like // in js
const ops = [
	// Arithmetic
	{name: "ps", f: (a, b) => parseFloat(a)+parseFloat(b)},
	{name: "sb", f: (a, b) => a-b},
	{name: "mt", f: (a, b) => a*b},
	{name: "dv", f: (a, b) => a/b},
	// Booleans
	{name: "and", f: (a, b) => parseBool(a) && parseBool(b)},
	{name: "or", f: (a, b) => parseBool(a) || parseBool(b)},
	{name: "~", f: (a) => !parseBool(a)},
	// Var Define
	{name: "is", f: (a, b) => {
		global[a] = b;
	}},
	// Var Declare
	{name: "local", f: (a) => {
		global[a] = null;
	}},
	// Console
	{name: "log", f: (a) => {
		out(a);
	}},
	{name: "linelog", f: (a, b = null) => {
		if (typeof a === "string") {
			a.split("\n").forEach(v => out(v));
		} else if (typeof a === "object") {
			a.forEach(v => out(v));
		} else {
			return toss("LineLog not accepted (Object or String only)", "ValClass")
		}
	}},
	// File reading
	{name: "im", f: (a) => {
		let read = fs.readFileSync(a+".jc", "utf8");
		return evalFunc(read);
	}},
	{name: "readf", f: (a) => {
		let read = fs.readFileSync(a, "utf8");
		return read.close();
	}},
	{name: "writef", f: (a, b) => {
		// Creates .spl (splash) file and writes
		// data to it.
		console.log(b);
		return fs.writeFileSync(a+".spl", b);
	}},
];

// Var scope
const global = [
	{name: "variable", value: "x"}
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

function toss(err, errt = "Generic") {
	console.error(errt + " Error > " + err);
}

function out(msg, type) {
	msg = msg.split("\n").join("\n^- ");
	if (type) console.log(type + " > " + msg);
	else console.log("-> " + msg);
}

function getAllIndexes(str, val) {
	var ixs = [];
	[...str].forEach((v, i) => {
		if (v === val) ixs.push(i);
	});
	return ixs;
}

function encodeStrings(code) {
	return code;
}

function lex(code) {
	// Code is a string
	code = code.split(/\n/g);
	code = removeComments(code);
	code = encodeStrings(code);
	// Operations
	for (const line in code) {
		for (const op of ops) {
			let oplen = op.f.length;
			let spaced = code[line].split(/\s/g);
			if (code[line].includes(op.name)) {
				// Time for an operation!
				if (oplen == 1) {
					for (kwn = spaced.length-1;kwn>=0;kwn--) {
						kwargs = spaced.slice(kwn-1, kwn+oplen);
						if (kwargs[oplen-1] == op.name) {
							spaced.splice(kwn-1, oplen+1, op.f(kwargs[1]));
						}
					}
				} else {
					// For each keyword index in line, reverse order
					for (kwn = spaced.length-1;kwn>=0;kwn--) {
						kwargs = spaced.slice(kwn-1, kwn+oplen);
						// If keyword before this is an op
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
	return lexRes;
}

class Val {
	constructor (v, parent) {
		this.val = v;
		this.parent = parent;
	}
}

class Num extends Val {
	constructor (n, parent) {
		super(n, parent);
		this.even = !(n % 2);
		this.odd = !this.even;
	}
	len() {return Math.ceil(Math.log10(this.val + 1))};
}

class Bool extends Val {
	constructor (v, parent) {
		super(!!v, parent);
	}
	ifTrue(func, func2) {
		if (this.val === true) func();
		else if (func2) func2();
	}
}

module.exports = {
	eval: evalFunc,
	lex: lex,
	toss: toss,
	out: out,
};