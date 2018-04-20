// https://docs.python.org/3/reference/index.html

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
		NEWLINE: 0
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
		
	},
};