// https://docs.python.org/3/reference/index.html

/**
Add TabError
*/

var Interpreter = {
	editorId: "editor",
	consoleId: "console",
	editor: null,
	console: null,
	functions: {
		print: function () {
			end = "\n";
			sep = " ";
			args = [];
			for (i in arguments) {
				args.push(arguments[i]);
			}
			for (i = 0; i < args.length; i++) {
				if (args[i].substr(0, 4) == "sep=") {
					sep = args[i].substr(4);
					args.splice(i, 1);
					i--;
				}
				if (args[i].substr(0, 4) == "end=") {
					end = args[i].substr(4);
					args.splice(i, 1);
					i--;
				}
			}
			for (i = 0; i < args.length; i++) {
				Interpreter.Print(args[i]);
				if (i + 1 == args.length) Interpreter.Print(end);
				else Interpreter.Print(sep);
			}
		}
	},

	TokenType: {
		UNTOKENIZED: "UNTOKENIZED",
		NEWLINE: "NEWLINE",
		INDENT: "INDENT",
		DEDENT: "DEDENT"
	},

	Token: class {
		constructor(type, value) {
			this.type = type;
			this.value = value;
		}
	},

	Init: function () {
		this.editor = document.getElementById(this.editorId);
		this.console = document.getElementById(this.consoleId);
	},

	Print: function (s) {
		this.console.value += s;
	},

	PrintLn: function (s) {
		this.console.value += s + '\n';
	},

	Run: function () {
		Array.prototype.tryPush = function (s) {
			if (s == "") return;
			this.push(s);
		}

		this.console.value = "";
		code = this.editor.value;
		physicalLines = code.split("\n");
		logicalLines = [];
		
		isString = "";
		backslash = false;
		lineJoin = false;
		stack = []; // keep count of () [] {}
		for (lineI = 0; lineI < physicalLines.length; lineI++) {
			comment = false;
			prev = "";
			any = false;
			line = physicalLines[lineI];
			for (i in line) {
				if (backslash) {
					backslash = false;
				} else if (isString) {
					if (line[i] == '\\') {
						backslash = true;
					} else if (line.substr(i, isString.length) == isString) {
						isString = false;
					}
				} else {
					if (line[i] == '#') { // found comment
						line = line.substr(0, i); // cut the comment away
						comment = true;
						break;
					} else if (line.substr(i, 3) == '"""' || line.substr(i, 3) == "'''") {
						isString = line.substr(i, 3);
					} else if (line[i] == '"' || line[i] == "'") {
						isString = line[i];
					} else if (line[i] == '[' || line[i] == '(' || line[i] == '{') {
						stack.push(line[i]);
					} else if (line[i] == ')') {
						if (!stack || stack[stack.length - 1] != '(') {
							this.PrintLn("Error: Unexpected ')' on line " + lineI);
						} else {
							stack.pop();
						}
					} else if (line[i] == ']') {
						if (!stack || stack[stack.length - 1] != '[') {
							this.PrintLn("Error: Unexpected '[' on line " + lineI);
						} else {
							stack.pop();
						}
					} else if (line[i] == '}') {
						if (!stack || stack[stack.length - 1] != '{') {
							this.PrintLn("Error: Unexpected '}' on line " + lineI);
						} else {
							stack.pop();
						}
					}
				}
				if ([' ', ' ', '\t', '\n'].indexOf(line[i]) == -1) {
					any = true;
					prev = line[i];
				}
			}
			if (isString.length == 1) {
				this.PrintLn("Error: string didn't end on line " + lineI);
			}

			if (any) {
				if (lineJoin) {
					logicalLines[logicalLines.length - 1] += line;
				} else {
					logicalLines.push(line);
				}
			}

			implicit = !isString && prev == ',' && stack;
			explicit = !isString && !comment && line[line.length - 1] == '\\';
			lineJoin = isString.length == 3 // multiline comment
					   || explicit
					   || implicit;

			if (explicit) { // remove '\'
				str = logicalLines[logicalLines.length - 1];
				logicalLines[logicalLines.length - 1] = str.substr(0, str.length - 1);
			}
		}
		if (isString) {
			this.PrintLn("Error: string didn't end on line " + lineI);	
		}

		indent = [];
		for (lineI = 0; lineI < logicalLines.length; lineI++) {
			ind = 0;
			line = logicalLines[lineI];
			for (i = 0; i < line.length; i++) {
				if (line[i] == ' ') ind++;
				else if (line[i] == '\t') ind += 4;
				else break;
			}
			indent.push(ind);
		}

		tokens = [];
		indentationStack = [0];
		for (i = 0; i < logicalLines.length; i++) {
			last = indentationStack[indentationStack.length - 1];
			if (indent[i] > last) {
				tokens.push(new this.Token(this.TokenType.INDENT, ""));
				indentationStack.push(indent[i]);
			} else {
				while (indent[i] < last) {
					tokens.push(new this.Token(this.TokenType.DEDENT, ""));
					indentationStack.pop();
					last = indentationStack[indentationStack.length - 1];
				}
				if (indent[i] != last) {
					this.PrintLn("TabError");
				}
			}
			tokens.push(new this.Token(this.TokenType.UNTOKENIZED, logicalLines[i]));
			tokens.push(new this.Token(this.TokenType.NEWLINE, ""));
		}
		while (indentationStack.length != 1) {
			tokens.push(new this.Token(this.TokenType.DEDENT, ""));
			indentationStack.pop();
		}
		
		for (token of tokens) {
			this.PrintLn("Token: " + token.type + " => " + token.value)
		}
	},
};