// Global Variables
let quizAttempts;
let userName;
let currentQuiz;
let allQuizzes;

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

/*
// parse json file and populate quiz selection drop down
function loadQuizList(quizSelect, quizLoadError) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "data/Quizzes.json", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            obj = JSON.parse(xhr.responseText);
            allQuizzes = obj.quizzes;
            //console.log(allQuizzes);

            let quizOptionsHTML = `<option value="">-- Select a Quiz --</option>`;
            
            for (i = 0; i < allQuizzes.length; i++){
                quizOptionsHTML += `<option value="` + i + `">` + allQuizzes[i].title + `</option>`;
            }
            quizSelect.innerHTML = quizOptionsHTML;
        } else if (xhr.readyState === 4) {
            quizLoadError.innerHTML = "Could not load quiz list. Check that data/quizzes.json exists";
            quizLoadError.classList.remove('hide');
        }
    };
    xhr.send();
}*/

// Renders a filtered subset of quizAttempts to the attempts table.
// originalIndices: array of index positions from the global quizAttempts array.
function renderAttemptsTable(originalIndices, attemptsTable, attemptsTbody, noAttemptsMsg, showDetailsBtn, attemptDetailsContainer) {
    attemptDetailsContainer.innerHTML = "";
    showDetailsBtn.classList.add('hide');

    if (originalIndices.length === 0) {
        noAttemptsMsg.classList.remove('hide');
        attemptsTable.classList.add('hide');
        return;
    }

    noAttemptsMsg.classList.add('hide');

    let rowsHtml = "";
    for (let i = 0; i < originalIndices.length; i++) {
        let idx = originalIndices[i];
        rowsHtml += '<tr data-index="' + idx + '">';
        rowsHtml += '<td>' + quizAttempts[idx].userName + '</td>';
        rowsHtml += '<td>' + quizAttempts[idx].quiz.title + '</td>';
        rowsHtml += '<td>' + quizAttempts[idx].timestamp + '</td>';
        rowsHtml += '</tr>';
    }
    attemptsTbody.innerHTML = rowsHtml;
    attemptsTable.classList.remove('hide');
    showDetailsBtn.classList.remove('hide');

    renderStats(originalIndices);
}

// Computes and displays summary statistics for a given set of attempt indices.
function renderStats(originalIndices) {
    let attemptsStats = document.querySelector('#attempts-stats');
    let statsContent = document.querySelector('#stats-content');

    if (originalIndices.length === 0) {
        attemptsStats.classList.add('hide');
        return;
    }

    let totalScore = 0;
    let highestScore = -1;
    let lowestScore = Infinity;
    let highestAttempt = null;
    let lowestAttempt = null;

    for (let i = 0; i < originalIndices.length; i++) {
        let attempt = quizAttempts[originalIndices[i]];
        let percentage = attempt.score / attempt.numQuestions;

        totalScore += percentage;

        if (percentage > highestScore) {
            highestScore = percentage;
            highestAttempt = attempt;
        }
        if (percentage < lowestScore) {
            lowestScore = percentage;
            lowestAttempt = attempt;
        }
    }

    let averagePercent = Math.round((totalScore / originalIndices.length) * 100);
    let highestPercent = Math.round(highestScore * 100);
    let lowestPercent = Math.round(lowestScore * 100);

    // Table 1: Highest and Lowest
    let html = '<table>';
    html += '<tr><th>Stat</th><th>Score</th><th>User</th><th>Quiz</th></tr>';

    html += '<tr>';
    html += '<td><strong>Highest</strong></td>';
    html += '<td>' + highestAttempt.score + ' / ' + highestAttempt.numQuestions + ' (' + highestPercent + '%)</td>';
    html += '<td>' + highestAttempt.userName + '</td>';
    html += '<td>' + highestAttempt.quiz.title + '</td>';
    html += '</tr>';

    html += '<tr>';
    html += '<td><strong>Lowest</strong></td>';
    html += '<td>' + lowestAttempt.score + ' / ' + lowestAttempt.numQuestions + ' (' + lowestPercent + '%)</td>';
    html += '<td>' + lowestAttempt.userName + '</td>';
    html += '<td>' + lowestAttempt.quiz.title + '</td>';
    html += '</tr>';

    html += '</table>';

    // Table 2: Average
    html += '<table id="stats-average-table">';
    html += '<tr><th>Stat</th><th>Score</th><th>Across</th></tr>';

    html += '<tr>';
    html += '<td><strong>Average</strong></td>';
    html += '<td>' + averagePercent + '%</td>';
    html += '<td>' + originalIndices.length + ' attempt(s)</td>';
    html += '</tr>';

    html += '</table>';

    statsContent.innerHTML = html;
    attemptsStats.classList.remove('hide');
}




window.onload = function () {
    
    initStorage();

    // DOM references
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
    const filterUsernameInput = document.querySelector('#filter-username-input');
    const filterBtn = document.querySelector('#filter-btn');
    const clearFilterBtn = document.querySelector('#clear-filter-btn');
    const usernameFilter = document.querySelector('#username-filter');


    // load quiz selection after defining DOM refrences to populate drop down
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "data/Quizzes.json", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let obj = JSON.parse(xhr.responseText);
            allQuizzes = obj.quizzes;

            let quizOptionsHTML = '<option value="">-- Select a Quiz --</option>';
            for (let i = 0; i < allQuizzes.length; i++) {
                quizOptionsHTML += '<option value="' + i + '">' + allQuizzes[i].title + '</option>';
            }
            quizSelect.innerHTML = quizOptionsHTML;
        } else if (xhr.readyState === 4) {
            quizLoadError.innerHTML = "Could not load quiz list. Check that data/Quizzes.json exists";
            quizLoadError.classList.remove('hide');
        }
    };
    xhr.send();




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
        // unhide error message if no quiz is selected and return.
        if (selectedValue == "") {
            quizLoadError.classList.remove('hide');
            return;
        }
        // hide error message if a quiz is selected.
        quizLoadError.classList.add('hide');
        let selectedIndex = Number(selectedValue);
        currentQuiz = allQuizzes[selectedIndex];

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
        initStorage();
        filterUsernameInput.value = ""; // clear any stale filter input

        if (quizAttempts.length === 0) {
            usernameFilter.classList.add('hide');
            noAttemptsMsg.classList.remove('hide');
            attemptsTable.classList.add('hide');
            showDetailsBtn.classList.add('hide');
            attemptDetailsContainer.innerHTML = "";
            return;
        }

        // Build a list of all indices and render the full table
        let allIndices = [];
        for (let i = 0; i < quizAttempts.length; i++) {
            allIndices.push(i);
        }
        renderAttemptsTable(allIndices, attemptsTable, attemptsTbody, noAttemptsMsg, showDetailsBtn, attemptDetailsContainer);
        usernameFilter.classList.remove('hide'); // show the filter UI
    });

    // Filter attempts by username
    filterBtn.addEventListener("click", function() {
        let filterValue = filterUsernameInput.value.trim().toLowerCase();

        let filteredIndices = [];
        for (let i = 0; i < quizAttempts.length; i++) {
            if (quizAttempts[i].userName.toLowerCase().includes(filterValue)) {
                filteredIndices.push(i);
            }
        }
        renderAttemptsTable(filteredIndices, attemptsTable, attemptsTbody, noAttemptsMsg, showDetailsBtn, attemptDetailsContainer);
    });

    // Clear filter and show all attempts
    clearFilterBtn.addEventListener("click", function() {
        filterUsernameInput.value = "";
        let allIndices = [];
        for (let i = 0; i < quizAttempts.length; i++) {
            allIndices.push(i);
        }
        renderAttemptsTable(allIndices, attemptsTable, attemptsTbody, noAttemptsMsg, showDetailsBtn, attemptDetailsContainer);
    });

    // Delegated click handler for attempts table rows
    attemptsTbody.addEventListener("click", function(e) {
        if (e.target.tagName === 'TD') {
            let clickedRow = e.target.parentElement;

            let rows = attemptsTbody.querySelectorAll('tr');
            for (let k = 0; k < rows.length; k++) {
                rows[k].classList.remove('selected');
            }
            clickedRow.classList.add('selected');
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