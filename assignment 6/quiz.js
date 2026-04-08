// Global Variables
let quizAttempts;
let userName;
let currentQuiz; // full quiz object (title + questions)
let allQuizes;

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
    html += "<p>Submitted by: " + quizAttempt.userName + "<br>On: " + quizAttempt.timestamp + "</p>";
    html += "<table>";
    html += "<tr><th>Question</th><th>Correct Answer</th><th>Your Answer</th><th>Score</th></tr>";

    for (let i = 0; i < quizAttempt.quiz.questions.length; i++) {
        let question = quizAttempt.quiz.questions[i];
        let userAnswerIndex = quizAttempt.userAnswers[i];
        let correctAnswerIndex = question.answer;
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

function loadQuizList(quizSelect, quizLoadError) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "data/Quizes.json", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            allQuizes = JSON.parse(xhr.responseText);
            console.log(allQuizes);

            let quizOptionsHTML = `<option value="">-- Select a Quiz --</option>`;
            
            for (i = 0; i < allQuizes.quizes.length; i++){
                quizOptionsHTML += `<option value="` + i + `">` + allQuizes.quizes[i].title + `</option>`;
            }
            quizSelect.innerHTML = quizOptionsHTML;
        } else if (xhr.readyState === 4) {
            quizLoadError.innerHTML = "Could not load quiz list. Check that data/quizzes.json exists";
            quizLoadError.classList.remove('hide');
        }
    };
    xhr.send();
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

    loadQuizList(quizSelect, quizLoadError);



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
    
    // app-level tab switching
    tabQuizBtn.addEventListener('click', function() {
        quizPanel.classList.remove('hide');
        attemptsPanel.classList.add('hide');
        tabQuizBtn.classList.add('active');
        tabAttemptsBtn.classList.remove('active');
    });

    tabAttemptsBtn.addEventListener('click', function() {
        attemptsPanel.classList.remove('hide');
        quizPanel.classList.add('hide');
        tabAttemptsBtn.classList.add('active');
        tabQuizBtn.classList.remove('active');
    });

    // Load Quiz
    loadQuizBtn.addEventListener('click', function() {
        let selectedValue = quizSelect.value;
        if (selectedValue == "") {
            quizLoadError.classList.remove('hide');
            return;
        }
        quizLoadError.classList.add('hide');
        let selectedIndex = Number(selectedValue);
        currentQuiz = allQuizes.quizes[selectedIndex];

        // Reset quiz area before loading new quiz
        quizHeader.innerHTML = "";
        tabContainer.innerHTML = "";
        tabContainer.classList.add('hide');
        questionsWrapper.innerHTML = "";
        submitBtn.classList.add('hide');
        submitError.classList.add('hide');
        resultsContainer.innerHTML = "";

        
        quizHeader.innerHTML = currentQuiz.title;

        let tabsHtml = "";
        let questionsHtml = "";

        for (let i = 0; i < currentQuiz.questions.length; i++) {
            // Per-question tab buttons
            let activeClass = "";
            if (i === 0) {
                activeClass = " active";
            }
            tabsHtml += '<button class="tab-button' + activeClass + '" data-index="' + i + '">Q' + (i + 1) + '</button>';

            // Per-question panels
            let hideClass = "";
                if (i !== 0) {
                hideClass = " hide";
            }
            questionsHtml += '<div class="question-panel' + hideClass + '" id="question-panel-' + i + '">';
            questionsHtml += '<p class="question-text">' + currentQuiz.questions[i].questionText + '</p>';

            for (let j = 0; j < currentQuiz.questions[i].choices.length; j++) {
                questionsHtml += '<div class="choice-item">';
                questionsHtml += '<label>';
                questionsHtml += '<input type="radio" name="question-' + i + '" value="' + j + '"> ';
                questionsHtml += currentQuiz.questions[i].choices[j];
                questionsHtml += '</label>';
                questionsHtml += '</div>';
            }
            questionsHtml += '</div>';
        }
        tabContainer.innerHTML = tabsHtml;
        questionsWrapper.innerHTML = questionsHtml;
        tabContainer.classList.remove('hide');
        submitBtn.classList.remove('hide');

        // Assign per-question tab click handlers
        // (assigned here because tabs don't exist until quiz loads)
        let questionTabs = tabContainer.querySelectorAll('.tab-button');
        for (let i = 0; i < questionTabs.length; i++) {
            questionTabs[i].addEventListener("click", function() {
                // Deactivate all question tabs
                for (let k = 0; k < questionTabs.length; k++) {
                    questionTabs[k].classList.remove('active');
                }
                // Hide all question panels
                let allPanels = questionsWrapper.querySelectorAll('.question-panel');
                for (let k = 0; k < allPanels.length; k++) {
                    allPanels[k].classList.add('hide');
                }
                // Activate the clicked tab and its panel
                questionTabs[i].classList.add('active');
                document.querySelector('#question-panel-' + i).classList.remove('hide');
            });
        }
    });
    
    // Submit Quiz
    submitBtn.addEventListener("click", function() {
        let userAnswers = [];
        let allAnswered = true;

        for (let i = 0; i < currentQuiz.questions.length; i++) {
            let selected = document.querySelector('input[name="question-' + i + '"]:checked');
            if (selected === null) {
                allAnswered = false;
                userAnswers[i] = null;
            } else {
                userAnswers[i] = Number(selected.value);
            }
        }

        if (!allAnswered) {
            submitError.classList.remove('hide');
            return;
        }
        submitError.classList.add('hide');

        // Build attempt object
        let quizAttempt = {
            userName: userName,
            quiz: currentQuiz,
            timestamp: new Date().toUTCString(),
            userAnswers: userAnswers,
            score: calcQuizScore(currentQuiz.questions, userAnswers),
            numQuestions: currentQuiz.questions.length
        };

        // Save to localStorage
        quizAttempts.push(quizAttempt);
        localStorage.setItem("quizAttempts", JSON.stringify(quizAttempts));

        // Display results
        displayResults(quizAttempt, resultsContainer);
    });

    // Load attempts
    loadAttemptsBtn.addEventListener("click", function() {
        initStorage(); // re-read from localStorage in case new attempts were added
        attemptDetailsContainer.innerHTML = "";
        showDetailsBtn.classList.add('hide');

        if (quizAttempts.length === 0) {
            noAttemptsMsg.classList.remove('hide');
            attemptsTable.classList.add('hide');
            return;
        }

        noAttemptsMsg.classList.add('hide');

        // Build table rows
        let rowsHtml = "";
        for (let i = 0; i < quizAttempts.length; i++) {
            rowsHtml += '<tr data-index="' + i + '">';
            rowsHtml += '<td>' + quizAttempts[i].userName + '</td>';
            rowsHtml += '<td>' + quizAttempts[i].quiz.title + '</td>';
            rowsHtml += '<td>' + quizAttempts[i].timestamp + '</td>';
            rowsHtml += '</tr>';
        }
        attemptsTbody.innerHTML = rowsHtml;
        attemptsTable.classList.remove('hide');
        showDetailsBtn.classList.remove('hide');

        // Assign row click handlers for selection
        let rows = attemptsTbody.querySelectorAll('tr');
        for (let i = 0; i < rows.length; i++) {
            rows[i].addEventListener("click", function() {
                // Remove selected from all rows
                for (let k = 0; k < rows.length; k++) {
                    rows[k].classList.remove('selected');
                }
                // Select the clicked row
                rows[i].classList.add('selected');
            });
        }
    });

    // Show details
    showDetailsBtn.addEventListener("click", function() {
        let rows = attemptsTbody.querySelectorAll('tr');
        let selectedIndex = -1;

        for (let i = 0; i < rows.length; i++) {
            if (rows[i].classList.contains('selected')) {
                selectedIndex = Number(rows[i].getAttribute('data-index'));
                break;
            }
        }

        if (selectedIndex === -1) {
            attemptDetailsContainer.innerHTML = '<p class="error-text">Please select an attempt from the table first.</p>';
            return;
        }

        displayResults(quizAttempts[selectedIndex], attemptDetailsContainer);
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