class Terminal {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.commands = {};
        this.hiddenCommands = {};
        this.repos = [];
        this.history = [];
        this.historyIndex = -1;
        this.init();
    }

    init() {
        this.printLine('Добро пожаловать! Введите "help" для списка команд.');
        this.input();
    }

    registerCommand(command) {
        if (command.hidden) {
            this.hiddenCommands[command.name] = command;
        } else {
            this.commands[command.name] = command;
        }
    }

    input() {
        const inputLine = document.createElement('div');
        inputLine.classList.add('input-line');

        const prompt = document.createElement('span');
        prompt.innerHTML = '>&nbsp;';
        inputLine.appendChild(prompt);

        const input = document.createElement('input');
        input.type = 'text';
        inputLine.appendChild(input);

        this.element.appendChild(inputLine);
        input.focus();

        input.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Enter':
                    const command = input.value.trim();

                    if (command) {
                        this.history.push(command);
                        this.historyIndex = this.history.length;
                        this.executeCommand(command);
                    }
                    
                    input.disabled = true;
                break;
                
                case 'ArrowUp':
                    e.preventDefault();

                    if (this.historyIndex > 0) {
                        this.historyIndex--;
                        input.value = this.history[this.historyIndex];
                    }
                break;

                case 'ArrowDown':
                    e.preventDefault();

                    if (this.historyIndex < this.history.length - 1) {
                        this.historyIndex++;
                        input.value = this.history[this.historyIndex];
                    } else {
                        this.historyIndex = this.history.length;
                        input.value = '';
                    }
                break;

                case 'Tab':
                    e.preventDefault();

                    const currentInput = input.value.trim();
                    const possibleCommands = Object.keys(this.commands).filter(cmd => cmd.startsWith(currentInput));

                    if (possibleCommands.length === 1) {
                        input.value = possibleCommands[0] + ' ';
                    } else if (possibleCommands.length > 1) {
                        this.printLine(possibleCommands.join('    '));
                    }
                break;
            }
        });
    }

    executeCommand(commandLine) {
        const [commandName, ...args] = commandLine.split(' ');
        const command = this.commands[commandName] || this.hiddenCommands[commandName];
    
        if (command) {
            const result = command.action(args);
    
            if (result && typeof result.then === 'function') {
                result.then(() => {
                    this.input();
                });
            } else {
                this.input();
            }
        } else {
            this.printLine(`Команда "${commandName}" не найдена.`);
            const suggestions = this.getSuggestions(commandName);
            if (suggestions.length > 0) this.printLine(`Возможно, вы имели в виду: ${suggestions.join(', ')}`);
            this.input();
        }
    }    

    getSuggestions(input) {
        const commands = Object.keys(this.commands);
        return commands.filter(cmd => {
            return this.levenshteinDistance(input, cmd) <= 2;
        });
    }

    levenshteinDistance(a, b) {
        const matrix = [];
    
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
    
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
    
        return matrix[b.length][a.length];
    }

    printLine(text, returnElement = false) {
        const line = document.createElement('div');
        line.classList.add('line');
        line.innerHTML = text;
        this.element.appendChild(line);
        this.element.scrollTop = this.element.scrollHeight;
        return returnElement ? line : null;
    }

    updateLine(line, text) {
        line.innerHTML = text;
        this.element.scrollTop = this.element.scrollHeight;
    }
}
