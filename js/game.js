// ===== Своя игра — чистый фронтенд =====
// Подгружаем questions.json через fetch, вся логика на клиенте

let questionsData = null;
let players = [];
let currentQuestion = null;
let totalQuestions = 0;
let answeredQuestions = 0;

// ===== Загрузка вопросов =====
async function loadQuestions() {
    try {
        const res = await fetch('questions.json');
        if (!res.ok) throw new Error('Не удалось загрузить questions.json');
        questionsData = await res.json();
        totalQuestions = countQuestions(questionsData);
    } catch (e) {
        console.error('Ошибка загрузки вопросов:', e);
        // Fallback — встроенные вопросы
        questionsData = getFallbackQuestions();
        totalQuestions = countQuestions(questionsData);
    }
}

function countQuestions(data) {
    let count = 0;
    data.categories.forEach(cat => count += cat.questions.length);
    return count;
}

// ===== Fallback-вопросы (если fetch не сработал, например при открытии через file://) =====
function getFallbackQuestions() {
    return {
        categories: [
            {
                name: "Логические задачи",
                questions: [
                    {points:100, question:"Два отца и два сына поймали трёх зайцев. Каждому досталось по одному. Как?", answer:"Это дед, отец и сын — три человека."},
                    {points:200, question:"В семье пять сыновей, у каждого одна сестра. Сколько детей?", answer:"Шесть. Сестра одна на всех."},
                    {points:300, question:"В комнате 3 лампочки, в соседней — 3 выключателя. Зайти можно один раз. Как определить?", answer:"Включить первый, подождать. Выключить, включить второй. Зайти: горит — второй, тёплая — первый, холодная — третий."},
                    {points:400, question:"Кувшин 3 л и 5 л. Отмерить 4 л.", answer:"Наполнить 5 л, перелить в 3 л (останется 2). Вылить 3, перелить 2. Наполнить 5, долить 1 в 3. Осталось 4."},
                    {points:500, question:"Три двери, за одной — автомобиль. Вы выбрали дверь 1, ведущий открыл дверь 3 с козой. Менять?", answer:"Да. Это парадокс Монти Холла: при смене — 2/3, без смены — 1/3."}
                ]
            },
            {
                name: "Математическая логика",
                questions: [
                    {points:100, question:"Что больше: сумма чисел от 1 до 100 или их произведение?", answer:"Произведение. Нуля среди них нет, значит произведение огромное."},
                    {points:200, question:"Сколько раз в сутки стрелки образуют прямой угол?", answer:"44 раза."},
                    {points:300, question:"10 носков: 5 чёрных, 5 белых. Сколько достать вслепую для пары?", answer:"3. Принцип Дирихле."},
                    {points:400, question:"Число: при делении на 3 ост. 1, на 5 — ост. 2, на 7 — ост. 3.", answer:"52."},
                    {points:500, question:"Волк, коза, капуста. Лодка вмещает одного. Как переправить?", answer:"Коза → назад → волк → забрать козу → капуста → назад → коза."}
                ]
            },
            {
                name: "Словесные загадки",
                questions: [
                    {points:100, question:"Что становится больше при перевороте?", answer:"Число 6 (становится 9)."},
                    {points:200, question:"Сколько звуков в слове «ЯМА»?", answer:"4 звука: [й'а м а]. Буква Я даёт два звука."},
                    {points:300, question:"В каком слове 100 букв «Л»?", answer:"СтоЛ. Игра слов: «сто Л»."},
                    {points:400, question:"В каком слове 40 гласных?", answer:"Сорок-А. «Сорок А»."},
                    {points:500, question:"«Слово — ..., а молчание — золото».", answer:"Серебро."}
                ]
            },
            {
                name: "Хитрые вопросы",
                questions: [
                    {points:100, question:"Увидели зелёного человечка. Что делать?", answer:"Перейти дорогу — это светофор!"},
                    {points:200, question:"Какое слово звучит неверно?", answer:"Слово «неверно»."},
                    {points:300, question:"У стола отпилили угол. Сколько осталось?", answer:"Пять. Появились два новых."},
                    {points:400, question:"Обогнали второго в марафоне. Какой вы теперь?", answer:"Второй. Вы заняли его место."},
                    {points:500, question:"Что путешествует по миру, оставаясь в углу?", answer:"Почтовая марка."}
                ]
            },
            {
                name: "Последовательности",
                questions: [
                    {points:100, question:"1, 1, 2, 3, 5, 8, ...", answer:"13. Числа Фибоначчи."},
                    {points:200, question:"2, 4, 8, 16, 32, ...", answer:"64. Умножение на 2."},
                    {points:300, question:"О, Д, Т, Ч, П, Ш, С, В, ...", answer:"Д. Первые буквы: Один, Два, Три... Девять."},
                    {points:400, question:"1, 4, 9, 16, 25, ...", answer:"36. Квадраты: 1, 2, 3..."},
                    {points:500, question:"А, В, Д, Ё, З, Й, ...", answer:"Л. Буквы через одну."}
                ]
            }
        ]
    };
}

// ===== Навигация между экранами =====
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ===== Стартовый экран =====
function initStartScreen() {
    let playerCount = 3;

    // Кнопки выбора количества
    document.querySelectorAll('#player-count-group button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#player-count-group button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            playerCount = parseInt(btn.dataset.count);
            renderPlayerInputs(playerCount);
        });
    });

    renderPlayerInputs(playerCount);

    document.getElementById('start-game-btn').addEventListener('click', () => {
        const inputs = document.querySelectorAll('#player-names input');
        players = [];
        inputs.forEach((inp, i) => {
            const name = inp.value.trim() || `Игрок ${i + 1}`;
            players.push({ name, score: 0 });
        });
        startGame();
    });
}

function renderPlayerInputs(count) {
    const container = document.getElementById('player-names');
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'input-group mb-2';
        div.innerHTML = `
            <span class="input-group-text bg-secondary text-light">${i + 1}</span>
            <input type="text" class="form-control" placeholder="Имя игрока ${i + 1}" maxlength="20" value="Игрок ${i + 1}">
        `;
        container.appendChild(div);
    }
}

// ===== Игровое поле =====
function startGame() {
    answeredQuestions = 0;
    renderPlayersTable();
    renderBoard();
    showScreen('game-screen');
}

function renderPlayersTable() {
    const container = document.getElementById('players-table');
    container.innerHTML = '';
    const colClass = players.length === 2 ? 'col-6' :
                      players.length === 3 ? 'col-4' : 'col-3';
    players.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = colClass;
        div.innerHTML = `
            <div class="player-card ${p.score < 0 ? 'negative' : ''}" id="player-card-${i}">
                <div class="player-name">${escapeHtml(p.name)}</div>
                <div class="player-score">${p.score}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    const catCount = questionsData.categories.length;
    const qPerCat = questionsData.categories[0].questions.length;
    board.style.gridTemplateColumns = `repeat(${catCount}, 1fr)`;
    board.style.gridTemplateRows = `auto repeat(${qPerCat}, 1fr)`;

    // Заголовки категорий
    questionsData.categories.forEach(cat => {
        const h = document.createElement('div');
        h.className = 'category-header';
        h.textContent = cat.name;
        board.appendChild(h);
    });

    // Ячейки с вопросами
    for (let row = 0; row < qPerCat; row++) {
        questionsData.categories.forEach((cat, ci) => {
            const q = cat.questions[row];
            const cell = document.createElement('div');
            cell.className = 'question-cell';
            cell.textContent = q.points;
            cell.dataset.cat = ci;
            cell.dataset.row = row;
            cell.addEventListener('click', () => openQuestion(ci, row, cell));
            board.appendChild(cell);
        });
    }
}

// ===== Открытие вопроса =====
function openQuestion(catIndex, qIndex, cell) {
    const cat = questionsData.categories[catIndex];
    const q = cat.questions[qIndex];
    currentQuestion = { ...q, catIndex, qIndex, cell };

    document.getElementById('question-category').textContent = cat.name;
    document.getElementById('question-points').textContent = q.points + ' очков';
    document.getElementById('question-text').textContent = q.question;
    document.getElementById('answer-block').classList.add('d-none');
    document.getElementById('answer-text').textContent = '';
    document.getElementById('show-answer-btn').classList.remove('d-none');
    document.getElementById('score-buttons').classList.add('d-none');
    document.getElementById('close-question-btn').classList.add('d-none');

    // Список игроков
    const sel = document.getElementById('answering-player');
    sel.innerHTML = '';
    players.forEach((p, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = p.name;
        sel.appendChild(opt);
    });
    document.getElementById('skip-btn').classList.remove('d-none');

    showScreen('question-screen');
}

// ===== Логика вопроса =====
function initQuestionScreen() {
    document.getElementById('show-answer-btn').addEventListener('click', () => {
        document.getElementById('answer-text').textContent = currentQuestion.answer;
        document.getElementById('answer-block').classList.remove('d-none');
        document.getElementById('show-answer-btn').classList.add('d-none');
        document.getElementById('score-buttons').classList.remove('d-none');
        document.getElementById('skip-btn').classList.add('d-none');
    });

    document.getElementById('correct-btn').addEventListener('click', () => {
        const idx = parseInt(document.getElementById('answering-player').value);
        players[idx].score += currentQuestion.points;
        closeQuestion();
    });

    document.getElementById('wrong-btn').addEventListener('click', () => {
        const idx = parseInt(document.getElementById('answering-player').value);
        players[idx].score -= currentQuestion.points;
        closeQuestion();
    });

    document.getElementById('skip-btn').addEventListener('click', () => {
        closeQuestion();
    });

    document.getElementById('close-question-btn').addEventListener('click', () => {
        closeQuestion();
    });
}

function closeQuestion() {
    currentQuestion.cell.classList.add('used');
    currentQuestion.cell.textContent = '';
    currentQuestion.cell.style.cursor = 'default';
    answeredQuestions++;
    renderPlayersTable();

    if (answeredQuestions >= totalQuestions) {
        showResults();
    } else {
        showScreen('game-screen');
    }
}

// ===== Результаты =====
function showResults() {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const container = document.getElementById('results-list');
    container.innerHTML = '';

    sorted.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'result-row' + (i === 0 && p.score > 0 ? ' winner' : '');
        div.innerHTML = `
            <div>
                ${i === 0 && p.score > 0 ? '👑 ' : ''}${i + 1}. ${escapeHtml(p.name)}
            </div>
            <div class="result-score">${p.score}</div>
        `;
        container.appendChild(div);
    });

    showScreen('results-screen');
}

// ===== Утилиты =====
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===== Инициализация =====
async function init() {
    await loadQuestions();
    initStartScreen();
    initQuestionScreen();

    document.getElementById('reset-btn').addEventListener('click', () => {
        showScreen('start-screen');
    });

    document.getElementById('play-again-btn').addEventListener('click', () => {
        showScreen('start-screen');
    });
}

init();