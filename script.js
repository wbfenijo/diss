document.addEventListener("DOMContentLoaded", () => {

    const ROWS = 6;
    const COLS = 5;

    let board = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
    let currentRow = 0;
    let currentCol = 0;
    let secret = "";
    let SOLUTIONS = [];
    let VALID = [];
    let invalidTimeout = null;



    const grid = document.getElementById("grid");
    const keyboard = document.getElementById("keyboard");
    const messageDiv = document.getElementById("message");
    const restartBtn = document.getElementById("restartBtn");

    for (let r = 0; r < ROWS; r++) {
        const row = document.createElement("div");
        row.className = "row";
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }

    function updateGrid() {
        for (let r = 0; r < ROWS; r++) {
            const rowDiv = grid.children[r];
            if (!rowDiv) continue;
            for (let c = 0; c < COLS; c++) {
                const cell = rowDiv.children[c];
                if (!cell) continue;
                cell.textContent = board[r][c];
                if (!cell.classList.contains("correct") &&
                    !cell.classList.contains("present") &&
                    !cell.classList.contains("absent")) {
                    cell.className = "cell"; 
                }
            }
        }
    }

    function endGame(won) {
        if (won) {
            messageDiv.textContent = "Vyhral si!";
        } else {
            messageDiv.textContent = "Prehral si! Slovo bolo: " + secret;
        }
        messageDiv.style.display = "block";
        restartBtn.style.display = "inline-block";
    }

    function restartGame() {
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
        currentRow = 0;
        currentCol = 0;
        secret = SOLUTIONS[Math.floor(Math.random() * SOLUTIONS.length)];
        console.log("New secret word:", secret);

        for (let r = 0; r < ROWS; r++) {
            const rowDiv = grid.children[r];
            for (let c = 0; c < COLS; c++) {
                const cell = rowDiv.children[c];
                cell.textContent = "";
                cell.className = "cell";
            }
        }

        document.querySelectorAll(".key").forEach(k => k.className = "key");

        messageDiv.style.display = "none";
        restartBtn.style.display = "none";
    }

    restartBtn.addEventListener("click", restartGame);

    function checkWord() {
        if (messageDiv.style.display === "block") {
            messageDiv.style.display = "none";
            if (invalidTimeout) {
                clearTimeout(invalidTimeout);
                invalidTimeout = null;
            }
        }

        if (currentCol !== COLS) return;

        const guess = board[currentRow].join("");
        if (!VALID.includes(guess)) {
            messageDiv.textContent = "Neplatné slovo!";
            messageDiv.style.display = "block";

            if (invalidTimeout) clearTimeout(invalidTimeout);
            invalidTimeout = setTimeout(() => {
                messageDiv.style.display = "none";
                invalidTimeout = null;
            }, 2000);
            return;
        }

        // pripravíme kópiu secret slova pre kontrolu prítomných písmen
        let secretArr = secret.split("");
        let guessArr = guess.split("");

        // najprv označíme správne pozície
        let letterStatus = Array(COLS).fill("absent");
        for (let i = 0; i < COLS; i++) {
            if (guessArr[i] === secretArr[i]) {
                letterStatus[i] = "correct";
                secretArr[i] = null; // už použitý
            }
        }

        // potom označíme prítomné písmená
        for (let i = 0; i < COLS; i++) {
            if (letterStatus[i] === "correct") continue;
            let idx = secretArr.indexOf(guessArr[i]);
            if (idx !== -1) {
                letterStatus[i] = "present";
                secretArr[idx] = null; // už použitý
            }
        }

        // aktualizujeme bunky
        for (let i = 0; i < COLS; i++) {
            const cell = grid.children[currentRow].children[i];
            cell.className = "cell"; // reset farieb
            if (letterStatus[i] !== "absent") {
                cell.classList.add(letterStatus[i]);
            }
        }

        currentRow++;
        currentCol = 0;

        if (guess === secret) {
            endGame(true);
            return;
        }

        if (currentRow === ROWS) {
            endGame(false);
        }
    }

    function createKeyboard() {
        const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
        rows.forEach(r => {
            const rowDiv = document.createElement("div");
            rowDiv.className = "keyboard-row";
            for (const k of r) {
                const key = document.createElement("div");
                key.className = "key";
                key.textContent = k;
                key.addEventListener("click", () => handleKey(k));
                rowDiv.appendChild(key);
            }
            keyboard.appendChild(rowDiv);
        });

        const special = document.createElement("div");
        special.className = "keyboard-row";
        ["enter", "backspace"].forEach(k => {
            const key = document.createElement("div");
            key.className = "key";
            key.textContent = k.toUpperCase();
            key.addEventListener("click", () => handleKey(k));
            special.appendChild(key);
        });
        keyboard.appendChild(special);
    }

    function handleKey(k) {
        if (k === "enter") {
            checkWord();
        } else if (k === "backspace") {
            if (currentCol > 0) {
                currentCol--;
                board[currentRow][currentCol] = "";
                updateGrid();
            }
        } else {
            if (currentCol < COLS && /^[a-z]$/.test(k)) {
                board[currentRow][currentCol] = k;
                currentCol++;
                updateGrid();
            }
        }
    }

    document.addEventListener("keydown", e => {
        if (e.key === "Enter") handleKey("enter");
        else if (e.key === "Backspace") handleKey("backspace");
        else if (/^[a-z]$/i.test(e.key)) handleKey(e.key.toLowerCase());
    });

    async function loadWords() {
        SOLUTIONS = await fetch("solutions.json").then(res => res.json());
        VALID = await fetch("valid_guesses.json").then(res => res.json());
        secret = SOLUTIONS[Math.floor(Math.random() * SOLUTIONS.length)];
        console.log("Secret word:", secret);
    }

    createKeyboard();
    loadWords();
    updateGrid();

});