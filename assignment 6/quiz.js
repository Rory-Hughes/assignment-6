// Global Variables
let quizAttempts;
let userName;
let currentQuiz; // full quiz object (title + questions)

// Storage
function initStorage() {
    let stored = localStorage.getItem("quizAttempts");
    if (stored === null) {
        quizAttempts = [];
    } else {
        quizAttempts = JSON.parse(stored);
    }
}

// Score Calculation
function calcQuizScore(questions, userAnswers) {
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] === questions[i].answer) {
            score++;
        }
    }
    return score;
}

// Display Results (shared by submit and show details)
function displayResults(quizAttempt, containerElement) {
    let html = "<h3>Results: " + quizAttempt.quiz.title + "</h3>";
    html += "<p>Submitted by: " + quizAttempt.userName + " &mdash; " + quizAttempt.timestamp + "</p>";
    html += "<table>";
    html += "<tr><th>Question</th><th>Correct Answer</th><th>Your Answer</th><th>Score</th></tr>";

    for (let i = 0; i < quizAttempt.quiz.questions.length; i++) {
        let question = quizAttempt.quiz.questions[i];
        let userAnswerIndex = quizAttempt.userAnswers[i];
        let correctAnswerIndex = question.correctAnswer;
        let correctAnswerText = question.choices[correctAnswerIndex];
        let userAnswerText = question.choices[userAnswerIndex];
        let pointScore = 0;
        if (userAnswerIndex === correctAnswerIndex) {
            pointScore = 1;
        }

        html += "<tr>";
        html += "<td>" + question.questionText + "</td>";
        html += "<td>" + correctAnswerText + "</td>";
        html += "<td>" + userAnswerText + "</td>";
        html += "<td>" + pointScore + "</td>";
        html += "</tr>";
    }

    html += "<tr>";
    html += "<td colspan='3'><strong>Total Score</strong></td>";
    html += "<td><strong>" + quizAttempt.score + " / " + quizAttempt.numQuestions + "</strong></td>";
    html += "</tr>";
    html += "</table>";

    containerElement.innerHTML = html;
}



window.onload = function () {
    
    initStorage();

    // --- DOM references ---
    const loginSection = document.querySelector('#login-section');
    const usernameInput = document.querySelector('#username-input');
    const loginBtn = document.querySelector('#login-btn');
    const loginError = document.querySelector('#login-error');
    const loggedInUser = document.querySelector('#logged-in-user');
    const mainApp = document.querySelector('#main-app');

    const tabQuizBtn = document.querySelector('#tab-quiz');
    const tabAttemptsBtn = document.querySelector('#tab-attempts');
    const quizPanel = document.querySelector('#quiz-panel');
    const attemptsPanel = document.querySelector('#attempts-panel');

    const quizSelect = document.querySelector('#quiz-select');
    const loadQuizBtn = document.querySelector('#load-quiz-btn');
    const quizLoadError = document.querySelector('#quiz-load-error');
    const quizHeader = document.querySelector('#quiz-header');
    const tabContainer = document.querySelector('#tab-container');
    const questionsWrapper = document.querySelector('#questions-wrapper');
    const submitBtn = document.querySelector('#submit-btn');
    const submitError = document.querySelector('#submit-error');
    const resultsContainer = document.querySelector('#results-container');

    const loadAttemptsBtn = document.querySelector('#load-attempts-btn');
    const attemptsTable = document.querySelector('#attempts-table');
    const attemptsTbody = document.querySelector('#attempts-tbody');
    const noAttemptsMsg = document.querySelector('#no-attempts-msg');
    const showDetailsBtn = document.querySelector('#show-details-btn');
    const attemptDetailsContainer = document.querySelector('#attempt-details-container');

    
    // const url = "data/MathQuiz.json";

    // Login    
    loginBtn.addEventListener('click', function() {
        let name = usernameInput.value.trim();
        if (name === "") {
            loginError.classList.remove('hide');
            return;
        }
        loginError.classList.add('hide');
        userName = name;
        loggedInUser.innerHTML = "Logged in as: " + userName;
        loginSection.classList.add('hide');
        mainApp.classList.remove('hide');

    });
    
    

    
};





/*

    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const obj = JSON.parse(xhr.responseText);
            quizHeader.innerHTML = obj.title;
            quizData = obj.questions;

            let tabsHtml = "";
            let questionsHtml = "";

            for (let i = 0; i < quizData.length; i++) {
                // Create Tab Buttons
                tabsHtml += `<button class="tab-button hide" id="tab-${i}">Question ${i + 1}</button>`;

                // Create Question Panels 
                questionsHtml += `<div class="question-panel hide" id="panel-${i}">`;
                questionsHtml += `<h3>Question ${i + 1}</h3>`;
                questionsHtml += `<p>${quizData[i].questionText}</p>`;

                for (let j = 0; j < quizData[i].choices.length; j++) {
                    questionsHtml += `
                        <div>
                            <input type="radio" name="q${i}" id="q${i}c${j}" value="${j}">
                            <label for="q${i}c${j}">${quizData[i].choices[j]}</label>
                        </div>`;
                }
                questionsHtml += `</div>`;
            }

            // Add the HTML to the DOM
            tabContainer.innerHTML = tabsHtml;
            questionsWrapper.innerHTML = questionsHtml;

            // Attach event listeners to the tabs
            const tabButtons = document.querySelectorAll('.tab-button');
            for (let i = 0; i < tabButtons.length; i++) {
                tabButtons[i].addEventListener('click', function() {
                    showQuestion(i);
                });
            }

            // Show the first question by default
            showQuestion(0);
        }
    };
    xhr.send();

    submitBtn.addEventListener('click', function() {
        processResults();
    });
};

// Global function to handle tab switching
function showQuestion(index) {
    const panels = document.querySelectorAll('.question-panel');
    const tabs = document.querySelectorAll('.tab-button');

    for (let i = 0; i < panels.length; i++) {
        panels[i].classList.remove('active');
        tabs[i].classList.remove('active');
    }

    document.querySelector('#panel-' + index).classList.add('active');
    document.querySelector('#tab-' + index).classList.add('active');
}

function processResults() {
    const resultsContainer = document.querySelector('#results-container');
    let totalScore = 0;
    let resultsHtml = "<h3>Your Results</h3><table border='1'><tr><th>Question</th><th>Correct Answer</th><th>Your Answer</th><th>Score</th></tr>";
    let allAnswered = true;

    // Loop through the quizData
    for (let i = 0; i < quizData.length; i++) {
        // Use querySelectorAll to find all radio buttons for this specific question
        const radios = document.querySelectorAll(`input[name="q${i}"]`);
        let selectedValue = -1;

        // for loop to check which radio is selected
        for (let j = 0; j < radios.length; j++) {
            if (radios[j].checked) {
                selectedValue = parseInt(radios[j].value);
                break; // Found the selection, exit inner loop
            }
        }

        // Validation Check: If any question is skipped, stop the process
        if (selectedValue === -1) {
            allAnswered = false;
            break;
        }

        // Scoring Logic
        const question = quizData[i];
        const correctIndex = question.answer;
        const correctAnswerText = question.choices[correctIndex];
        const userAnswerText = question.choices[selectedValue];
        let score = 0;
        let rowStyle = "";

        if (selectedValue === correctIndex) {
            score = 1;
            totalScore += 1;
        } else {
            // Apply the error-text class from your CSS for incorrect answers
            rowStyle = "class='error-text'"; 
        }

        // Build the table row string
        resultsHtml += `<tr ${rowStyle}>
            <td>${question.questionText}</td>
            <td>${correctAnswerText}</td>
            <td>${userAnswerText}</td>
            <td>${score}</td>
        </tr>`;
    }

    // Final Output
    if (!allAnswered) {
        // Display warning if validation fails
        resultsContainer.innerHTML = "<p class='error-text'>Please answer all questions before submitting.</p>";
    } else {
        // Close the table and add the total score row
        resultsHtml += `<tr><td colspan='3'><strong>Total Score</strong></td><td><strong>${totalScore} / ${quizData.length}</strong></td></tr></table>`;
        resultsContainer.innerHTML = resultsHtml;
    }
}
    */