document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("trivia-form");
    const questionContainer = document.getElementById("question-container");
    const newPlayerButton = document.getElementById("new-player");
    const loadingContainer = document.getElementById("loading-container");

    checkUsername();
    fetchQuestions();
    displayScores();

    form.addEventListener("submit", handleFormSubmit);
    newPlayerButton.addEventListener("click", newPlayer);

    function fetchQuestions() {
        showLoading(true);
        fetch("https://opentdb.com/api.php?amount=5&type=multiple")
            .then((response) => response.json())
            .then((data) => {
                displayQuestions(data.results);
                showLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching questions:", error);
                showLoading(false);
            });
    }

    function showLoading(isLoading) {
        loadingContainer.classList.toggle("hidden", !isLoading);
        questionContainer.classList.toggle("hidden", isLoading);
    }

    function displayQuestions(questions) {
        questionContainer.innerHTML = "";
        questions.forEach((question, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.innerHTML = `
                <p>${question.question}</p>
                ${createAnswerOptions(question.correct_answer, question.incorrect_answers, index)}
            `;
            questionContainer.appendChild(questionDiv);
        });
    }

    function createAnswerOptions(correctAnswer, incorrectAnswers, questionIndex) {
        const allAnswers = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
        return allAnswers.map(answer => `
            <label>
                <input type="radio" name="answer${questionIndex}" value="${answer}" ${answer === correctAnswer ? 'data-correct="true"' : ""}>
                ${answer}
            </label>
        `).join("");
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        const username = getCookie("username") || document.getElementById("username").value || "Anonymous";
        setCookie("username", username, 7);
        const score = calculateScore();
        saveScore(username, score);
        displayScores();
        fetchQuestions();
        checkUsername();
    }

    function calculateScore() {
        let score = 0;
        document.querySelectorAll("[name^=answer]").forEach((input) => {
            if (input.checked && input.dataset.correct) {
                score += 1;
            }
        });
        return score;
    }

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    function getCookie(name) {
        const nameEQ = `${name}=`;
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(nameEQ)) return cookie.substring(nameEQ.length);
        }
        return null;
    }

    function saveScore(username, score) {
        const scores = JSON.parse(localStorage.getItem("scores") || "[]");
        scores.push({ username, score });
        localStorage.setItem("scores", JSON.stringify(scores));
    }

    function displayScores() {
        const scores = JSON.parse(localStorage.getItem("scores") || "[]");
        const tbody = document.querySelector("#score-table tbody");
        tbody.innerHTML = "";
        scores.forEach(({ username, score }) => {
            const row = tbody.insertRow();
            row.innerHTML = `<td>${username}</td><td>${score}</td>`;
        });
    }

    function newPlayer() {
        setCookie("username", "", -1);
        checkUsername();
    }

    function checkUsername() {
        const username = getCookie("username");
        document.getElementById("username").style.display = username ? "none" : "block";
        newPlayerButton.classList.toggle("hidden", !username);
    }
});
