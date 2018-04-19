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
		lines = code.split('\n');
		for (i in lines) {
			line = lines[i];
			current = "";
			tokens = [];
			string = false;
			backslash = false;
			for (j = 0; j < line.length; j++) {
				c = line[j];
				cn = "";
				cnn = "";
				if (j + 1 != line.length) cn = line[j + 1];
				if (j + 2 < line.length) cnn = line[j + 2];

				if (string != "") {
					if (c == '\\') {
						backslash = true;
					} else if (backslash) {
						backslash = false;
						if (c == "n") {
							current += "\n";
						} else {
							this.PrintLn("Not yet implemented: \\" + c);
						}
					} else {
						current += c;
						if (c == string) {
							string = false;
							tokens.tryPush(current);
							current = "";
						}
					}
				} else {
					if (c == '"' || c == "'") {
						tokens.tryPush(current);
						current = c;
						string = c;
					} else if (c == '(' || c == ')' || c == '[' || c == ']' || c == '{' || c == '}' || c == ",") {
						tokens.tryPush(current);
						tokens.tryPush(c);
						current = "";
					} else if (c == ' ') {
						tokens.tryPush(current);
						current = "";
					} else if (c == '/' && cn == '/' && cnn == '=') {
						tokens.tryPush(current);
						tokens.tryPush("//=");
						current = "";
						j += 2;
					} else if ((c == '/' || c == '&' || c == '|' || c == '<' || c == '>') && c == cn) {
						tokens.tryPush(current);
						tokens.tryPush(c + cn);
						current = "";
						j += 1;
					} else if ((c == '=' || c == '&' || c == '|' || c == '^' || c == '+' || c == '-' || c == '*' || c == '/' || c == '<' || c == '>' || c == '!' || c == '%') && cn == '=') {
						tokens.tryPush(current);
						tokens.tryPush(c + cn);
						current = "";
						j++;
					} else if (c == '+' || c == '-' || c == '=' || c == '<' || c == '>' || c == '*' || c == '/' || c == '~' || c == '^' || c == '|' || c == '&' || c == '%') {
						tokens.tryPush(current);
						tokens.tryPush(c);
						current = "";
					} else {
						current += c;
					}
				}
			}
			tokens.tryPush(current);
		}
	},
};