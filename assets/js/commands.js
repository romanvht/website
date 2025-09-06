terminal.registerCommand(new Command('help', 'Список доступных команд или помощь по конкретной команде', function (args) {
    if (args.length === 0) {
        terminal.printLine('Доступные команды:');
        for (let cmd in terminal.commands) {
            terminal.printLine(`${cmd} - ${terminal.commands[cmd].description}`);
        }
    } else {
        const commandName = args[0];
        const command = terminal.commands[commandName];

        if (command) {
            terminal.printLine(`Помощь по команде "${commandName}":`);
            terminal.printLine(`${command.description}`);
            if (command.usage) {
                terminal.printLine(`Использование: ${command.usage}`);
            }
        } else {
            terminal.printLine(`Команда "${commandName}" не найдена.`);
        }
    }
}));

terminal.registerCommand(new Command('info', 'Информация о себе', function () {
    terminal.printLine(`
        <div>
            <p>
                <strong>Telegram:</strong>
                <a href="http://t.me/romanvht" target="_blank">t.me/romanvht</a><br>
                <strong>GitHub:</strong>
                <a href="https://github.com/romanvht" target="_blank">github.com/romanvht</a>
            </p>
            <p><strong>Ключевые навыки</strong></p>
            <ul>
                <li><strong>Backend:</strong> PHP, Python, Kotlin, .NET (C#), Node JS</li>
                <li><strong>Frontend:</strong> JavaScript, HTML5/CSS3, Bootstrap</li>
                <li><strong>Базы данных:</strong> MySQL, SQLite, PostgreSQL, Redis</li>
                <li><strong>DevOps:</strong> Docker, Git, Nginx, Apache</li>
                <li><strong>Прочее:</strong> Composer, Bash, REST, Sphinx/Manticore</li>
            </ul>
        </div>
    `);
}));

terminal.registerCommand(new Command('projects', 'Показать проекты с GitHub', function () {
    return new Promise((resolve) => {
        const line = terminal.printLine('Загрузка...', true);

        fetch('/github.php?action=list_repos')
            .then(response => response.json())
            .then(data => {
                const repos = data.repos;

                if (repos.length === 0) {
                    line.innerHTML = 'Нет публичных репозиториев.';
                    resolve();
                    return;
                }

                let projects = 'Список репозиториев:<br>';
                terminal.repos = repos;

                terminal.repos.forEach((repo, index) => {
                    projects += `${index + 1}. <a target="_blank" href="${repo.html_url}">${repo.name}</a> - ${repo.description || 'Нет описания'}<br>`;
                });

                projects += 'Введите "project [номер]" для просмотра README.';

                terminal.updateLine(line, projects);
                resolve();
            })
            .catch(error => {
                console.error(error);
                terminal.updateLine(line, 'Произошла ошибка');
                resolve();
            });
    });
}));

terminal.registerCommand(new Command('project', 'Показать README выбранного репозитория', function (args) {
    return new Promise((resolve) => {
        if (terminal.repos.length === 0) {
            terminal.printLine('Сначала выполните команду "projects" для получения списка репозиториев.');
            resolve();
            return;
        }

        const index = parseInt(args[0], 10) - 1;
        if (isNaN(index) || index < 0 || index >= terminal.repos.length) {
            terminal.printLine('Пожалуйста, введите корректный номер репозитория.');
            resolve();
            return;
        }

        const repo = terminal.repos[index];
        const line = terminal.printLine('Загрузка...', true);

        fetch(`/github.php?action=get_readme&repo=${repo.name}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Не удалось получить README.');
                }
                return response.text();
            })
            .then(readme => {
                terminal.updateLine(line, marked.parse(readme));
                resolve();
            })
            .catch(error => {
                console.error(error);
                terminal.updateLine(line, 'Произошла ошибка');
                resolve();
            });
    });
}, 'project [номер|int]'));

terminal.registerCommand(new Command('weather', 'Показать погоду для выбранного города', function (args) {
    return new Promise((resolve) => {
        if (args.length === 0) {
            terminal.printLine('Пожалуйста, введите город. Например: "weather Москва".');
            resolve();
            return;
        }

        const city = args.join(' ');
        const line = terminal.printLine('Загрузка погоды...', true);

        fetch(`https://wttr.in/${city}?format=%C+%t`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Не удалось получить данные о погоде.');
                }
                return response.text();
            })
            .then(data => {
                terminal.updateLine(line, `Погода в городе ${city}: ${data}`);
                resolve();
            })
            .catch(error => {
                console.error(error);
                terminal.updateLine(line, 'Произошла ошибка при получении погоды.');
                resolve();
            });
    });
}, 'weather [город|string]'));

terminal.registerCommand(new Command('translate', 'Перевести текст на указанный язык (en, ru, fr, de, es)', function (args) {
    return new Promise((resolve) => {
        let sourceLang = 'ru';
        let targetLang = 'en';
        let textToTranslate = '';

        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-from' && args[i + 1]) {
                sourceLang = args[i + 1];
                i++;
            } else if (args[i] === '-to' && args[i + 1]) {
                targetLang = args[i + 1];
                i++;
            } else if (args[i].startsWith('-')) {
                terminal.printLine(`Неизвестная опция "${args[i]}". Используйте "-from" и "-to" для указания языков.`);
                resolve();
                return;
            } else {
                textToTranslate = args.slice(i).join(' ');
                break;
            }
        }

        if (!textToTranslate) {
            terminal.printLine('Пожалуйста, введите текст для перевода. Например: "translate -from ru -to en Привет мир".');
            resolve();
            return;
        }

        const line = terminal.printLine('Перевод...', true);

        fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(textToTranslate) + '&langpair=' + sourceLang + '|' + targetLang)
            .then(response => response.json())
            .then(data => {
                if (data.responseData && data.responseData.translatedText) {
                    const translatedText = data.responseData.translatedText;
                    terminal.updateLine(line, `Перевод (${sourceLang} → ${targetLang}): ${translatedText}`);
                } else {
                    terminal.updateLine(line, 'Не удалось получить перевод.');
                }
                resolve();
            })
            .catch(error => {
                console.error(error);
                terminal.updateLine(line, 'Произошла ошибка при переводе.');
                resolve();
            });
    });
}, 'translate [-from исходный_язык] [-to целевой_язык] текст для перевода'));

terminal.registerCommand(new Command('ip', 'Показать ваш IP-адрес', function () {
    return new Promise((resolve) => {
        const line = terminal.printLine('Определение IP-адреса...', true);
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                terminal.updateLine(line, `Ваш IP-адрес: ${data.ip}`);
                resolve();
            })
            .catch(error => {
                console.error(error);
                terminal.updateLine(line, 'Не удалось получить IP-адрес.');
                resolve();
            });
    });
}));

terminal.registerCommand(new Command(
    'rps',
    'Игра "Камень, ножницы, бумага"',
    function (args) {
        const choices = ['камень', 'ножницы', 'бумага'];
        const userChoice = args[0]?.trim().toLowerCase();

        if (!userChoice || !choices.includes(userChoice)) {
            terminal.printLine('Пожалуйста, укажите ваш выбор после команды.');
            return;
        }

        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        terminal.printLine(`Вы выбрали: ${userChoice}`);
        terminal.printLine(`Компьютер выбрал: ${computerChoice}`);

        if (userChoice === computerChoice) {
            terminal.printLine('Ничья!');
        } else if (
            (userChoice === 'камень' && computerChoice === 'ножницы') ||
            (userChoice === 'ножницы' && computerChoice === 'бумага') ||
            (userChoice === 'бумага' && computerChoice === 'камень')
        ) {
            terminal.printLine('Вы выиграли!');
        } else {
            terminal.printLine('Вы проиграли!');
        }
    },
    'rps [камень|ножницы|бумага]'
));

terminal.registerCommand(new Command(
    'coin',
    'Бросить монетку',
    function () {
        const outcomes = ['Орёл', 'Решка'];
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
        terminal.printLine(`${result}`);
    },
    'coin'
));

terminal.registerCommand(new Command('time', 'Показать текущее время и дату', function () {
    const now = new Date();
    const formattedTime = now.toLocaleString('ru-RU', { hour12: false });
    terminal.printLine(`Текущее время и дата: ${formattedTime}`);
}));

terminal.registerCommand(new Command('history', 'Показать историю команд', function () {
    if (terminal.history.length > 0) {
        terminal.printLine('История команд:');
        terminal.history.forEach((cmd, index) => {
            terminal.printLine(`${index + 1}. ${cmd}`);
        });
    } else {
        terminal.printLine('История команд пуста');
    }
}));

terminal.registerCommand(new Command('contacts', 'Показать контактную информацию', function () {
    terminal.printLine('Контактная информация:');
    terminal.printLine('Email: <a href="mailto:romanvht@gmail.com">romanvht@gmail.com</a>');
    terminal.printLine('GitHub: <a href="https://github.com/romanvht">https://github.com/romanvht</a>');
}));

terminal.registerCommand(new Command('clear', 'Очистить терминал', function () {
    terminal.element.innerHTML = '';
}));

terminal.registerCommand(new Command('hacktheplanet', 'Запустить взлом планеты', function () {
    return new Promise((resolve) => {
        const messages = [
            'Взлом начался...',
            'Анализируем данные...',
            'Подключаемся к серверам...',
            'Взламываем брандмауэр...',
            'Получаем доступ...',
            'Загружаем вирус...',
            'Вирус успешно загружен!',
            'Взлом завершен!'
        ];

        let index = 0;
        function displayNextMessage() {
            if (index < messages.length) {
                terminal.printLine(messages[index]);
                index++;
                setTimeout(displayNextMessage, Math.random() * 500 + 500);
            } else {
                resolve();
            }
        }

        displayNextMessage();
    });
}, '', true));

terminal.registerCommand(new Command('rm', 'Ай-яй-яй', function () {
    return new Promise((resolve) => {
        const messages = [
            'А ты хорош...',
            'Но ничего не получится...',
            'Твой запрос уже перехвачен...',
            'Я уже на твоем ПК...',
            'Упс...',
            'Я уже позади тебя...',
            'Обернись!'
        ];

        let index = 0;
        function displayNextMessage() {
            if (index < messages.length) {
                terminal.printLine(messages[index]);
                index++;
                setTimeout(displayNextMessage, Math.random() * 500 + 500);
            } else {
                terminal.printLine('<div id="ascii-animation"></div>');
                (async () => {
                    try {
                        const frames = await loadAsciiFrames('/assets/json/ascii_frames.json');
                        const asciiAnimationDivId = 'ascii-animation';
                        const desiredFps = 15;
                        displayAsciiAnimation(asciiAnimationDivId, frames, desiredFps);
                    } catch (error) {
                        console.error(error);
                    }
                })();
                resolve();
            }
        }

        displayNextMessage();
    });
}, '', true));
