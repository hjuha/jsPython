// https://docs.python.org/3/reference/index.html

/**
Add TabError
*/

var Interpreter = {
	editorId: "editor",
	consoleId: "console",
	editor: null,
	console: null,

	Variable: class {
		constructor (type, value) {
			this.type = type;
			this.value = value;
		}
	},

	VarType: {
		STRING: "str",
		INTEGER: "int",
		FLOAT: "float",
		COMPLEX: "complex",
		BOOLEAN: "bool"
	},

	variables: {
		
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
		AWAIT: "AWAIT",
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
		IMAGINARY: "IMAGINARY",
		// Operators
		PLUS: "+",
		MINUS: "-",
		ASTERISK: "*",
		DOUBLE_ASTERISK: "**",
		SLASH: "/",
		DOUBLE_SLASH: "//",
		PERCENT: "%",
		AT: "@",
		DOUBLE_LESS: "<<",
		DOUBLE_MORE: ">>",
		AMPERSAND: "&",
		PIPE: "|",
		CARET: "^",
		TILDE: "~",
		LESS: "<",
		MORE: ">",
		LESS_EQUAL: "<=",
		MORE_EQUAL: ">=",
		DOUBLE_EQUAL: "==",
		INEQUAL: "!=",
		// Delimiters
		LEFT_PARENTHESIS: "(",
		RIGHT_PARENTHESIS: ")",
		LEFT_BRACKET: "[",
		RIGHT_BRACKET: "]",
		LEFT_BRACE: "{",
		RIGHT_BRACE: "}",
		COMMA: ",",
		COLON: ":",
		PERIOD: ".",
		SEMICOLON: ";",
		EQUAL: "=",
		ARROW: "->",
		PLUS_EQUAL: "+=",
		MINUS_EQUAL: "-=",
		ASTERISK_EQUAL: "*=",
		SLASH_EQUAL: "/=",
		DOUBLE_SLASH_EQUAL: "//=",
		PERCENT_EQUAL: "%=",
		AT_EQUAL: "@=",
		AMPERSAND_EQUAL: "&=",
		PIPE_EQUAL: "|=",
		CARET_EQUAL: "^=",
		DOUBLE_LESS_EQUAL: "<<=",
		DOUBLE_MORE_EQUAL: ">>=",
		DOUBLE_ASTERISK_EQUAL: "**="
	},

	Token: class {
		constructor(type, value) {
			this.type = type;
			this.value = value;
		}
	},

	ExprType: {
		ATOM: "atom",
		IDENTIFIER: "identifier",
		LITERAL: "literal",
		PARENTH_FORM: "parenth_form",
		STARRED_EXPRESSION: "starred_expression",
		COMPREHENSION: "comprehension",
		EXPRESSION: "expression",
		COMP_FOR: "comp_for",
		TARGET_LIST: "target_list",
		OR_TEST: "or_test",
		COMP_ITER: "comp_iter",
		COMP_IF: "comp_if",
		EXPRESSION_NOCOND: "expression_nocond",
		LIST_DISPLAY: "list_display",
		SET_DISPLAY: "set_display",
		STARRED_LIST: "starred_list", 
		DICT_DISPLAY: "dict_display", // not implemented
		KEY_DATUM_LIST: "key_datum_list", // not implemented
		KEY_DATUM: "key_datum", // not implemented
		DICT_COMPREHENSION: "dict_comprehension", // not implemented
		GENERATOR_EXPRESSION: "generator_expression",
		YIELD_ATOM: "yield_atom", // not implemented
		YIELD_EXPRESSION: "yield_expression", // not implemented
		PRIMARY: "primary",
		ATTRIBUTEREF: "attributeref",
		SUBSCRIPTION: "subscription",
		SLICING: "slicing", // not implemented
		CALL: "call", // not implemented
		EXPRESSION_LIST: "expression_list",
		SLICE_LIST: "slice_list", // not implemented
		SLICE_ITEM: "slice_item", // not implemented
		PROPER_SLICE: "proper_slice", // not implemented
		AWAIT_EXPR: "await_expr",
		POWER: "power",
		U_EXPR: "u_expr",
		M_EXPR: "m_expr",
		A_EXPR: "a_expr",
	},

	Expr: class {
		constructor(type, tkn) {
			this.type = type;
			this.token = tkn;
			this.children = [];
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

	Tokenize: function (code) {
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

				operator = "";
				{
					operators = ["+", "-", "*", "**", "/", "//", "%", "@", "<<", ">>", "&", "|", "^", "~", "<", ">", "<=", ">=", "==", "!="];
					op = "";
					for (k = j; k < line.length; k++) {
						op += line[k];
						if (operators.indexOf(op) != -1) operator = op;
						if (op.length == 2) break;
					}
				}

				delimiter = "";
				{
					delimiters = ["(", ")", "[", "]", "{", "}", ",", ".", ";", ":", "=", "->", "+=", "-=", "*=", "/=", "//=", "%=", "@=", "&=", "|=", "^=", ">>=", "<<=", "**="];
					del = "";
					for (k = j; k < line.length; k++) {
						del += line[k];
						if (delimiters.indexOf(del) != -1) delimiter = del;
						if (del.length == 3) break;
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

				if (delimiter && delimiter.length >= operator.length) {
					j += delimiter.length - 1;
					switch (delimiter) {
						case "(":
							tokens.push(new this.Token(this.TokenType.LEFT_PARENTHESIS, delimiter));
							break;
						case ")":
							tokens.push(new this.Token(this.TokenType.RIGHT_PARENTHESIS, delimiter));
							break;
						case "[":
							tokens.push(new this.Token(this.TokenType.LEFT_BRACKET, delimiter));
							break;
						case "]":
							tokens.push(new this.Token(this.TokenType.RIGHT_BRACKET, delimiter));
							break;
						case "{":
							tokens.push(new this.Token(this.TokenType.LEFT_BRACE, delimiter));
							break;
						case "}":
							tokens.push(new this.Token(this.TokenType.RIGHT_BRACE, delimiter));
							break;
						case ",":
							tokens.push(new this.Token(this.TokenType.COMMA, delimiter));
							break;
						case ".":
							tokens.push(new this.Token(this.TokenType.PERIOD, delimiter));
							break;
						case ";":
							tokens.push(new this.Token(this.TokenType.SEMICOLON, delimiter));
							break;
						case ":":
							tokens.push(new this.Token(this.TokenType.COLON, delimiter));
							break;
						case "=":
							tokens.push(new this.Token(this.TokenType.EQUAL, delimiter));
							break;
						case "->":
							tokens.push(new this.Token(this.TokenType.ARROW, delimiter));
							break;
						case "+=":
							tokens.push(new this.Token(this.TokenType.PLUS_EQUAL, delimiter));
							break;
						case "-=":
							tokens.push(new this.Token(this.TokenType.MINUS_EQUAL, delimiter));
							break;
						case "*=":
							tokens.push(new this.Token(this.TokenType.ASTERISK_EQUAL, delimiter));
							break;
						case "/=":
							tokens.push(new this.Token(this.TokenType.SLASH_EQUAL, delimiter));
							break;
						case "//=":
							tokens.push(new this.Token(this.TokenType.DOUBLE_SLASH_EQUAL, delimiter));
							break;
						case "%=":
							tokens.push(new this.Token(this.TokenType.PERCENT_EQUAL, delimiter));
							break;
						case "@=":
							tokens.push(new this.Token(this.TokenType.AT_EQUAL, delimiter));
							break;
						case "&=":
							tokens.push(new this.Token(this.TokenType.AMPERSAND_EQUAL, delimiter));
							break;
						case "|=":
							tokens.push(new this.Token(this.TokenType.PIPE_EQUAL, delimiter));
							break;
						case "^=":
							tokens.push(new this.Token(this.TokenType.CARET_EQUAL, delimiter));
							break;
						case ">>=":
							tokens.push(new this.Token(this.TokenType.DOUBLE_MORE_EQUAL, delimiter));
							break;
						case "<<=":
							tokens.push(new this.Token(this.TokenType.DOUBLE_LESS, delimiter));
							break;
						case "**=":
							tokens.push(new this.Token(this.TokenType.DOUBLE_ASTERISK_EQUAL, delimiter));
							break;
					}
				} else if (operator) {
					j += operator.length - 1;
					switch (operator) {
						case "+":
							tokens.push(new this.Token(this.TokenType.PLUS, operator));
							break;
						case "-":
							tokens.push(new this.Token(this.TokenType.MINUS, operator));
							break;
						case "*":
							tokens.push(new this.Token(this.TokenType.ASTERISK, operator));
							break;
						case "**":
							tokens.push(new this.Token(this.TokenType.DOUBLE_ASTERISK, operator));
							break;
						case "/":
							tokens.push(new this.Token(this.TokenType.SLASH, operator));
							break;
						case "//":
							tokens.push(new this.Token(this.TokenType.DOUBLE_SLASH, operator));
							break;
						case "%":
							tokens.push(new this.Token(this.TokenType.PERCENT, operator));
							break;
						case "@":
							tokens.push(new this.Token(this.TokenType.AT, operator));
							break;
						case "<<":
							tokens.push(new this.Token(this.TokenType.DOUBLE_LESS, operator));
							break;
						case ">>":
							tokens.push(new this.Token(this.TokenType.DOUBLE_MORE, operator));
							break;
						case "&":
							tokens.push(new this.Token(this.TokenType.AMPERSAND, operator));
							break;
						case "|":
							tokens.push(new this.Token(this.TokenType.PIPE, operator));
							break;
						case "^":
							tokens.push(new this.Token(this.TokenType.CARET, operator));
							break;
						case "~":
							tokens.push(new this.Token(this.TokenType.TILDE, operator));
							break;
						case "<":
							tokens.push(new this.Token(this.TokenType.LESS, operator));
							break;
						case ">":
							tokens.push(new this.Token(this.TokenType.MORE, operator));
							break;
						case "<=":
							tokens.push(new this.Token(this.TokenType.LESS_EQUAL, operator));
							break;
						case ">=":
							tokens.push(new this.Token(this.TokenType.MORE_EQUAL, operator));
							break;
						case "==":
							tokens.push(new this.Token(this.TokenType.DOUBLE_EQUAL, operator));
							break;
						case "!=":
							tokens.push(new this.Token(this.TokenType.INEQUAL, operator));
							break;
					}
				} else if (imaginary) {
					j += imaginary.length - 1;
					tokens.push(new this.Token(this.TokenType.IMAGINARY, imaginary));
				} else if (float && float != integer) {
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
						case "await":
							tokens.push(new this.Token(this.TokenType.AWAIT, identifier));
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
			tokens.push(new this.Token(this.TokenType.NEWLINE, ""));
		}
		while (indentationStack.length != 1) {
			tokens.push(new this.Token(this.TokenType.DEDENT, ""));
			indentationStack.pop();
		}
		return tokens;
	},

	Parse: function (tokens) {
		Array.prototype.equals = function (arr) {
			if (!arr) return false;
			if (arr.length != this.length) return false;
			for (x = 0; x < arr.length; x++) {
				a = 0;
				b = 0;
				if (typeof arr[x] == "string") {
					a = arr[x];
				} else {
					a = arr[x].type;
				}
				if (typeof this[x] == "string") {
					b = this[x];
				} else {
					b = this[x].type;
				}
				if (a != b) return false;
			}
			return true;
		}
		getTypes = function (arr, i, k) {
			ret = [];
			while (k > 0 && i < arr.length) {
				ret.push(arr[i].type);
				k--;
				i++;
			}
			return ret;
		}

		TT = this.TokenType;
		ET = this.ExprType;
		parsed = [];
		for (t = 0; t < tokens.length; t++) {
			token = tokens[t];
			if (token.type == TT.IDENTIFIER) {
				atom = new this.Expr(ET.ATOM, null);
				atom.children.push(new this.Expr(ET.IDENTIFIER, token));
				parsed.push(atom);
			} else if ([TT.TRUE, TT.FALSE, TT.STRING, TT.INTEGER, TT.FLOAT, TT.IMAGINARY].indexOf(token.type) != -1) {
				atom = new this.Expr(ET.ATOM, null);
				atom.children.push(new this.Expr(ET.LITERAL, token));
				parsed.push(atom);
			} else parsed.push(token);
		}

		while (true) {
			original = [];
			for (i = 0; i < parsed.length; i++) {
				original.push(new this.Expr(parsed[i].type, null));
			}
			
			for (let i = 0; i < parsed.length; i++) {
				if (getTypes(parsed, i, 3).equals([TT.LEFT_PARENTHESIS, ET.ATOM, TT.RIGHT_PARENTHESIS])) {
					parsed.splice(i + 2, 1);	
					parsed.splice(i, 1);
					break;
				} else if (i == 0 && [TT.MINUS, TT.PLUS, TT.TILDE].indexOf(parsed[i].type) != -1 && getTypes(parsed, i+1,1).equals([ET.ATOM])) {
					expr = new this.Expr(ET.ATOM, null);
					expr.children.push(parsed[i]);
					expr.children.push(parsed[i + 1]);
					parsed.splice(i, 2, expr);
					break;
				} else if (i != 0 && [TT.MINUS, TT.PLUS, TT.TILDE].indexOf(parsed[i].type) != -1 && getTypes(parsed, i+1,1).equals([ET.ATOM]) && [TT.EQUAL, TT.LEFT_BRACE, TT.LEFT_BRACKET, TT.LEFT_PARENTHESIS, TT.PLUS_EQUAL, TT.AMPERSAND_EQUAL, TT.DOUBLE_EQUAL, TT.MORE_EQUAL, TT.LESS_EQUAL, TT.CARET_EQUAL, TT.PIPE_EQUAL, TT.DOUBLE_AMPERSAND_EQUAL, TT.DOUBLE_EQUAL, TT.AT_EQUAL, TT.PERCENT_EQUAL, TT.MINUS_EQUAL, TT.SLASH_EQUAL, TT.DOUBLE_SLASH_EQUAL, TT.DOUBLE_LESS_EQUAL, TT.DOUBLE_MORE_EQUAL, TT.PLUS, TT.ASTERISK, TT.MINUS, TT.DOUBLE_ASTERISK, TT.DOUBLE_SLASH, TT.SLASH, TT.CARET, TT.TILDE].indexOf(parsed[i - 1].type) != -1) {
					expr = new this.Expr(ET.ATOM, null);
					expr.children.push(parsed[i]);
					expr.children.push(parsed[i + 1]);
					parsed.splice(i, 2, expr);
					break;
				}
			}

			if (!original.equals(parsed)) continue;

			for (i = 0; i < parsed.length; i++) {
				if (getTypes(parsed, i, 4).equals([ET.ATOM, TT.EQUAL, ET.ATOM, TT.NEWLINE])) {
					expr = new this.Expr(ET.EXPRESSION, null);
					expr.children.push(parsed[i + 1]);
					expr.children.push(parsed[i]);
					expr.children.push(parsed[i + 2]);
					parsed.splice(i, 4, expr);
					break;
				}
			}

			if (!original.equals(parsed)) continue;
			
			for (i = 0; i < parsed.length; i++) {
				if (getTypes(parsed, i, 3).equals([ET.ATOM, TT.ASTERISK, ET.ATOM])) {
					expr = new this.Expr(ET.ATOM, null);
					expr.children.push(parsed[i + 1]);
					expr.children.push(parsed[i]);
					expr.children.push(parsed[i + 2]);
					parsed.splice(i, 3, expr);
					break;
				} else if (getTypes(parsed, i, 3).equals([ET.ATOM, TT.SLASH, ET.ATOM])) {
					expr = new this.Expr(ET.ATOM, null);
					expr.children.push(parsed[i + 1]);
					expr.children.push(parsed[i]);
					expr.children.push(parsed[i + 2]);
					parsed.splice(i, 3, expr);
					break;
				} else if (getTypes(parsed, i, 3).equals([ET.ATOM, TT.DOUBLE_SLASH, ET.ATOM])) {
					expr = new this.Expr(ET.ATOM, null);
					expr.children.push(parsed[i + 1]);
					expr.children.push(parsed[i]);
					expr.children.push(parsed[i + 2]);
					parsed.splice(i, 3, expr);
					break;
				} else if (getTypes(parsed, i, 3).equals([ET.ATOM, TT.PERCENT, ET.ATOM])) {
					expr = new this.Expr(ET.ATOM, null);
					expr.children.push(parsed[i + 1]);
					expr.children.push(parsed[i]);
					expr.children.push(parsed[i + 2]);
					parsed.splice(i, 3, expr);
					break;
				}
			}

			if (!original.equals(parsed)) continue;
			
			for (i = 0; i < parsed.length; i++) {
				if (getTypes(parsed, i, 3).equals([ET.ATOM, TT.MINUS, ET.ATOM])) {
					expr = new this.Expr(ET.ATOM, null);
					expr.children.push(parsed[i + 1]);
					expr.children.push(parsed[i]);
					expr.children.push(parsed[i + 2]);
					parsed.splice(i, 3, expr);
					break;
				} else if (getTypes(parsed, i, 3).equals([ET.ATOM, TT.PLUS, ET.ATOM])) {
					expr = new this.Expr(ET.ATOM, null);
					expr.children.push(parsed[i + 1]);
					expr.children.push(parsed[i]);
					expr.children.push(parsed[i + 2]);
					parsed.splice(i, 3, expr);
					break;
				}
			}

			if (!original.equals(parsed)) continue;
			
			for (i = 0; i < parsed.length; i++) {
				if (getTypes(parsed, i, 2).equals([TT.MINUS, ET.ATOM])) {
					expr = new this.Expr(ET.ATOM, null);
					expr.children.push(parsed[i]);
					expr.children.push(parsed[i + 1]);
					parsed.splice(i, 2, expr);
					break;
				} else if (getTypes(parsed, i, 2).equals([TT.PLUS, ET.ATOM])) {
					expr = new this.Expr(ET.ATOM, null);
					expr.children.push(parsed[i]);
					expr.children.push(parsed[i + 1]);
					parsed.splice(i, 2, expr);
					break;
				} else if (getTypes(parsed, i, 2).equals([TT.TILDE, ET.ATOM])) {
					expr = new this.Expr(ET.ATOM, null);
					expr.children.push(parsed[i]);
					expr.children.push(parsed[i + 1]);
					parsed.splice(i, 2, expr);
					break;
				}
			}

			if (original.equals(parsed)) break;
		}

		return parsed;
	},

	PrintNode: function (n, d) {
		for (let i = 0; i < d; i++) this.Print("  ");
		if (n instanceof this.Expr) {
			if (n.token != null) this.PrintLn("[" + n.type + "] " + "(" + n.token.type + ") " + n.token.value);
			else this.PrintLn("[" + n.type + "] " + "null");
			for (let c = 0; c < n.children.length; c++) {
				child = n.children[c];
				this.PrintNode(child, d + 1);
			}
		} else {
			this.PrintLn("[" + n.type + "] " + n.value);
		}
	},

	Simplify: function (n) {
		if (n instanceof this.Expr) {
			if (n.token == null || n.token.value == null) {
				n.token = n.children[0];
				if (n.token instanceof this.Expr) {
					n.token = n.token.token;
				}
				n.children.shift();
			}
			for (let c = 0; c < n.children.length; c++) {
				child = n.children[c];
				this.Simplify(child);
			}
		}
	},

	Error: function (s, n) {
		this.PrintLn("[Virhe] " + s + " rivillä " + "NotImplemented");
	},

	Evaluate: function (n) {
		TT = this.TokenType;
		ET = this.ExprType;

		if (n instanceof this.Expr) {
			let token = n.token;

			if (n.type == ET.EXPRESSION) {
				let tType = token.type;
				if (tType == TT.EQUAL) {
					let varNode = n.children[0];
					if (varNode.token.type != TT.IDENTIFIER) {
						this.Error("Sijoituksen vasemmalla puolella ei ollut muuttujanimeä", n);
						return;
					}

					let value = this.Evaluate(n.children[1]);
					this.variables[varNode.token.value] = value;
				}
			} else if (n.type == ET.ATOM) {
				if (token.type == TT.STRING) {
					return new this.Variable(this.VarType.STRING, token.value);
				}
				if (token.type == TT.INTEGER) {
					return new this.Variable(this.VarType.INTEGER, parseInt(token.value));
				}
				if (token.type == TT.FLOAT) {
					return new this.Variable(this.VarType.FLOAT, parseFloat(token.value));
				}
				if (token.type == TT.IMAGINARY) {
					return new this.Variable(this.VarType.COMPLEX, [0, parseFloat(token.value)]);
				}
				if (token.type == TT.TRUE) {
					return new this.Variable(this.VarType.BOOLEAN, 1);
				}
				if (token.type == TT.FALSE) {
					return new this.Variable(this.VarType.BOOLEAN, 0);
				}
				if (token.type == TT.IDENTIFIER) {
					if (this.variables.hasOwnProperty(token.value)) {
						return this.variables[token.value];
					} else {
						this.Error("Määrittelemätön muuttuja \"" + token.value + "\"", n);
						return;
					}
				}
				let VT = this.VarType;
				if (token.type == TT.PLUS) {
					if (n.children.length == 1) {
						let var1 = this.Evaluate(n.children[0]);
						if (var1.type == VT.BOOLEAN) var1.type = VT.INTEGER;
						if (var1.type != this.VarType.INTEGER && var1.type != this.VarType.FLOAT && var1.type != this.VarType.COMPLEX) {
							this.Error("Unaarista operaattoria \"+\" ei ole määritelty tyypille \"" + var1.type + "\"", n);
							return;
						}
						return var1;
					} else {
						let var1 = this.Evaluate(n.children[0]);
						if (var1.type == VT.BOOLEAN) var1.type = VT.INTEGER;
						let var2 = this.Evaluate(n.children[1]);
						if (var2.type == VT.BOOLEAN) var2.type = VT.INTEGER;
						if (var1.type == VT.STRING && var2.type == VT.STRING) {
							return new this.Variable(VT.STRING, var1.value + var2.value)
						} else if (var1.type == VT.COMPLEX && var2.type == VT.COMPLEX) {
							return new this.Variable(VT.COMPLEX, [var1.value[0] + var2.value[0], var1.value[1] + var2.value[1]]);
						} else if (var1.type == VT.COMPLEX && (var2.type == VT.INTEGER || var2.type == VT.FLOAT)) {
							return new this.Variable(VT.COMPLEX, [var1.value[0] + var2.value, var1.value[1]]);
						} else if (var2.type == VT.COMPLEX && (var1.type == VT.INTEGER || var1.type == VT.FLOAT)) {
							return new this.Variable(VT.COMPLEX, [var2.value[0] + var1.value, var2.value[1]]);
						} else if (var1.type == VT.FLOAT && (var2.type == VT.INTEGER || var2.type == VT.FLOAT)) {
							return new this.Variable(VT.FLOAT, var1.value + var2.value);
						} else if (var2.type == VT.FLOAT && (var1.type == VT.INTEGER || var1.type == VT.FLOAT)) {
							return new this.Variable(VT.FLOAT, var1.value + var2.value);
						} else if (var2.type == VT.INTEGER && var1.type == VT.INTEGER) {
							return new this.Variable(VT.INTEGER, var1.value + var2.value);
						} else {
							this.Error("Binääristä operaattoria \"+\" ei ole määritelty tyypeille \"" + var1.type + "\" ja \"" + var2.type + "\"", n);
							return;
						}
					}
				}

				if (token.type == TT.MINUS) {
					if (n.children.length == 1) {
						let var1 = this.Evaluate(n.children[0]);
						if (var1.type == VT.BOOLEAN) var1.type = VT.INTEGER;
						if (var1.type != this.VarType.INTEGER && var1.type != this.VarType.FLOAT && var1.type != this.VarType.COMPLEX) {
							this.Error("Unaarista operaattoria \"-\" ei ole määritelty tyypille \"" + var1.type + "\"", n);
							return;
						}
						if (var1.type == this.VarType.COMPLEX) return new this.Variable(this.VarType.COMPLEX, [-var1.value[0], -var2.value[1]]);
						return new this.Variable(var1.type, -var1.value);
					} else {
						let VT = this.VarType;
						let var1 = this.Evaluate(n.children[0]);
						if (var1.type == VT.BOOLEAN) var1.type = VT.INTEGER;
						let var2 = this.Evaluate(n.children[1]);
						if (var2.type == VT.BOOLEAN) var2.type = VT.INTEGER;
						if (var1.type == VT.COMPLEX && var2.type == VT.COMPLEX) {
							return new this.Variable(VT.COMPLEX, [var1.value[0] - var2.value[0], var1.value[1] - var2.value[1]]);
						} else if (var1.type == VT.COMPLEX && (var2.type == VT.INTEGER || var2.type == VT.FLOAT)) {
							return new this.Variable(VT.COMPLEX, [var1.value[0] - var2.value, var1.value[1]]);
						} else if (var2.type == VT.COMPLEX && (var1.type == VT.INTEGER || var1.type == VT.FLOAT)) {
							return new this.Variable(VT.COMPLEX, [var2.value[0] - var1.value, var2.value[1]]);
						} else if (var1.type == VT.FLOAT && (var2.type == VT.INTEGER || var2.type == VT.FLOAT)) {
							return new this.Variable(VT.FLOAT, var1.value - var2.value);
						} else if (var2.type == VT.FLOAT && (var1.type == VT.INTEGER || var1.type == VT.FLOAT)) {
							return new this.Variable(VT.FLOAT, var1.value - var2.value);
						} else if (var2.type == VT.INTEGER && var1.type == VT.INTEGER) {
							return new this.Variable(VT.INTEGER, var1.value - var2.value);
						} else {
							this.Error("Binääristä operaattoria \"-\" ei ole määritelty tyypeille \"" + var1.type + "\" ja \"" + var2.type + "\"", n);
							return;
						}
					}
				}
			}
		}

		return new this.Variable();
	},

	Run: function () {
		Array.prototype.tryPush = function (s) {
			if (s == "") return;
			this.push(s);
		}

		this.variables = {};

		this.console.value = "";
		code = this.editor.value;
		
		tokens = this.Tokenize(code);
		
		parsed = this.Parse(tokens);

		/*for (t = 0; t < tokens.length; t++) {
			token = tokens[t];
			this.PrintLn("Token: " + token.type + " => " + token.value);
		}*/

		for (t = 0; t < parsed.length; t++) {
			node = parsed[t];
			this.Simplify(node);
			this.PrintNode(node, 0);
		}

		for (t = 0; t < parsed.length; t++) {
			this.Evaluate(parsed[t]);
		}

		for (x in this.variables) {
			if (this.variables.hasOwnProperty(x)) {
				this.PrintLn("Variable " + x + ": [" + this.variables[x].type + "] " + this.variables[x].value);
			}
		}
	},
};