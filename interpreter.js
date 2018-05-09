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
		DEDENT: "DEDENT",
		FALSE: "FALSE",
		NONE: "NONE",
		TRUE: "TRUE",
		AND: "AND",
		AS: "AS",
		ASSERT: "ASSERT",
		BREAK: "BREAK",
		CLASS: "CLASS",
		CONTINUE: "CONTINUE",
		DEF: "DEF",
		DEL: "DEL",
		ELIF: "ELIF",
		ELSE: "ELSE",
		EXCEPT: "EXCEPT",
		FINALLY: "FINALLY",
		FOR: "FOR",
		FROM: "FROM",
		GLOBAL: "GLOBAL",
		IF: "IF",
		IMPORT: "IMPORT",
		IN: "IN",
		IS: "IS",
		LAMBDA: "LAMBDA",
		NONLOCAL: "NONLOCAL",
		NOT: "NOT",
		OR: "OR",
		PASS: "PASS",
		RAISE: "RAISE",
		RETURN: "RETURN",
		TRY: "TRY",
		WHILE: "WHILE",
		WITH: "WITH",
		YIELD: "YIELD",
		IDENTIFIER: "IDENTIFIER",
		STRING: "STRING",
		INTEGER: "INTEGER",
		FLOAT: "FLOAT",
		IMAGINARY: "IMAGINARY"
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
			line = logicalLines[i];
			for (j = 0; j < line.length; j++) {
				integer = "";
				if (line.substr(j, 2).match("^0[xXoObB]$")) { 
					integer = line.substr(j, 2);
					for (k = j + 2; k < line.length; k++) { // TODO: Check for invalid values
						if (line[k].match("^[0-9A-Fa-f]$")) integer += line[k];
						else break;
					}
				} else {
					for (k = j; k < line.length; k++) {
						if (line[k].match("^[0-9]$")) integer += line[k];
						else break;
					}
				}

				float = "";
				imaginary = "";
				for (k = j; k < line.length; k++) {
					if (float) {
						if (line[k] == 'e' || line[k] == 'E') {
							if (k + 1 == line.length) {
								// ERROR
							} else {
								float += line[k];
								k++;
								if (line[k].match("^[\\+\\-0-9]$")) {
									float += line[k];
								}
							}
						} else if (line[k].match("^[0-9\\.]$")) float += line[k];
						else {
							if (line[k] == 'j' || line[k] == 'J') {
								imaginary = float + line[k];
								float = "";
							}
							break;
						}
					} else {
						if (line[k].match("^[0-9\\.]$")) float += line[k];
						else break;
					}
				}

				identifier = "";
				for (k = j; k < line.length; k++) {
					if (identifier) {
						if (line[k].match("^[A-Za-z0-9_]$")) identifier += line[k];
						else break;
					} else {
						if (line[k].match("^[A-Za-z_]$")) identifier += line[k];
						else break;
					}
				}

				string = "";
				{
					beginning = "";
					if (line.substr(j, 3) == '"""') beginning = '"""';
					else if (line.substr(j, 3) == "'''") beginning = "'''";
					else if (line[j] == "'") beginning = "'";
					else if (line[j] == '"') beginning = '"';
					
					if (beginning) {
						string = beginning;
						backslash = false;
						for (k = j + beginning.length; k < line.length; k++) {
							if (backslash) {
								backslash = false;
							} else if (string) {
								if (line[k] == '\\') {
									backslash = true;
								} else if (line.substr(k, beginning.length) == beginning) {
									string += beginning;
									break;
								}
							}
							string += line[k];
						}
					}
				}

				if (imaginary) {
					j += imaginary.length - 1;
					tokens.push(new this.Token(this.TokenType.IMAGINARY, imaginary));
				} else if (float) {
					j += float.length - 1;
					tokens.push(new this.Token(this.TokenType.FLOAT, float));
				} else if (integer) {
					j += integer.length - 1;
					tokens.push(new this.Token(this.TokenType.INTEGER, integer));
				} else if (string) {
					j += string.length - 1;
					while ((string[0] == '"' || string[0] == "'") && string[0] == string[string.length - 1]) {
						string = string.substr(1, string.length - 2);
					}
					if (tokens && tokens[tokens.length - 1].type == this.TokenType.STRING) {
						tokens[tokens.length - 1].value = tokens[tokens.length - 1].value + string;
					} else {
						tokens.push(new this.Token(this.TokenType.STRING, string));
					}
				} else if (identifier) {
					switch (identifier) {
						case "False":
							tokens.push(new this.Token(this.TokenType.FALSE, identifier));
							break;
						case "None":
							tokens.push(new this.Token(this.TokenType.NONE, identifier));
							break;
						case "True":
							tokens.push(new this.Token(this.TokenType.TRUE, identifier));
							break;
						case "and":
							tokens.push(new this.Token(this.TokenType.AND, identifier));
							break;
						case "as":
							tokens.push(new this.Token(this.TokenType.AS, identifier));
							break;
						case "assert":
							tokens.push(new this.Token(this.TokenType.ASSERT, identifier));
							break;
						case "break":
							tokens.push(new this.Token(this.TokenType.BREAK, identifier));
							break;
						case "class":
							tokens.push(new this.Token(this.TokenType.CLASS, identifier));
							break;
						case "continue":
							tokens.push(new this.Token(this.TokenType.CONTINUE, identifier));
							break;
						case "def":
							tokens.push(new this.Token(this.TokenType.DEF, identifier));
							break;
						case "del":
							tokens.push(new this.Token(this.TokenType.DEL, identifier));
							break;
						case "elif":
							tokens.push(new this.Token(this.TokenType.ELIF, identifier));
							break;
						case "else":
							tokens.push(new this.Token(this.TokenType.ELSE, identifier));
							break;
						case "except":
							tokens.push(new this.Token(this.TokenType.EXCEPT, identifier));
							break;
						case "finally":
							tokens.push(new this.Token(this.TokenType.FINALLY, identifier));
							break;
						case "for":
							tokens.push(new this.Token(this.TokenType.FOR, identifier));
							break;
						case "from":
							tokens.push(new this.Token(this.TokenType.FROM, identifier));
							break;
						case "global":
							tokens.push(new this.Token(this.TokenType.GLOBAL, identifier));
							break;
						case "if":
							tokens.push(new this.Token(this.TokenType.IF, identifier));
							break;
						case "import":
							tokens.push(new this.Token(this.TokenType.IMPORT, identifier));
							break;
						case "in":
							tokens.push(new this.Token(this.TokenType.IN, identifier));
							break;
						case "is":
							tokens.push(new this.Token(this.TokenType.IS, identifier));
							break;
						case "lambda":
							tokens.push(new this.Token(this.TokenType.LAMBDA, identifier));
							break;
						case "nonlocal":
							tokens.push(new this.Token(this.TokenType.NONLOCAL, identifier));
							break;
						case "not":
							tokens.push(new this.Token(this.TokenType.NOT, identifier));
							break;
						case "or":
							tokens.push(new this.Token(this.TokenType.OR, identifier));
							break;
						case "pass":
							tokens.push(new this.Token(this.TokenType.PASS, identifier));
							break;
						case "raise":
							tokens.push(new this.Token(this.TokenType.RAISE, identifier));
							break;
						case "return":
							tokens.push(new this.Token(this.TokenType.RETURN, identifier));
							break;
						case "try":
							tokens.push(new this.Token(this.TokenType.TRY, identifier));
							break;
						case "while":
							tokens.push(new this.Token(this.TokenType.WHILE, identifier));
							break;
						case "with":
							tokens.push(new this.Token(this.TokenType.WITH, identifier));
							break;
						case "yield":
							tokens.push(new this.Token(this.TokenType.YIELD, identifier));
							break;
						default:
							tokens.push(new this.Token(this.TokenType.IDENTIFIER, identifier));
							break;
					}
					j += identifier.length - 1;
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