// ====== Route guard: exam must start after login ======
if (!localStorage.getItem("currentUserEmail")) {
  location.replace("signin.html");
}

// ====== Clear old answers at exam start (per user) ======
const currentUserEmail = localStorage.getItem("currentUserEmail");
const examKey = `examStarted_${currentUserEmail}`;

if (!sessionStorage.getItem(examKey)) {
  // مسح إجابات اليوزر الحالي فقط
  for (let i = 0; i < 50; i++) {
    localStorage.removeItem(`question_${currentUserEmail}_${i}`);
  }
  sessionStorage.setItem(examKey, "true");
}

// ====== Shuffle Function ======
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ====== Variables and Questions ======
let currentIndex = 0;
let score = 0;
let favQuestion = [];

// Original questions array
const originalQuestions = [
  {
    question: "What does HTML stand for?",
    choices: [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hyper and Markup Language",
      "Home Tool Markup Language",
    ],
    correctAnswer: 0,
  },
  {
    question: "Which company developed JavaScript?",
    choices: ["Microsoft", "Google", "Netscape", "Apple"],
    correctAnswer: 2,
  },
  {
    question: "Which symbol is used for comments in JavaScript?",
    choices: ["<!-- -->", "//", "**", "##"],
    correctAnswer: 1,
  },
  {
    question: "Which method converts JSON to object?",
    choices: [
      "JSON.parse()",
      "JSON.stringify()",
      "JSON.convert()",
      "JSON.object()",
    ],
    correctAnswer: 0,
  },
  {
    question: "Which keyword declares a constant in JS?",
    choices: ["var", "let", "const", "static"],
    correctAnswer: 2,
  },
  {
    question: "What does CSS stand for?",
    choices: [
      "Cascading Style Sheets",
      "Computer Style Sheets",
      "Creative Style System",
      "Colorful Style Sheets",
    ],
    correctAnswer: 0,
  },
  {
    question: "Which HTML tag is used for creating a hyperlink?",
    choices: ["<link>", "<a>", "<href>", "<url>"],
    correctAnswer: 1,
  },
  {
    question: "What is the correct way to declare a variable in JavaScript?",
    choices: ["variable x = 5", "let x = 5", "v x = 5", "var: x = 5"],
    correctAnswer: 1,
  },
  {
    question: "Which property is used to change the background color in CSS?",
    choices: ["color", "bg-color", "background-color", "bgcolor"],
    correctAnswer: 2,
  },
  {
    question: "What does DOM stand for?",
    choices: [
      "Document Object Model",
      "Data Object Management",
      "Digital Online Media",
      "Document Orientation Mode",
    ],
    correctAnswer: 0,
  },
];

// Shuffle questions for this exam session
const questions = shuffleArray(originalQuestions);

// Save questions for review (بعد الـ shuffle)
localStorage.setItem("examQuestions", JSON.stringify(questions));

//====== Timer Function with Red Alert ======
let timer;
let timerDuration = 60;

function timerBar(duration = timerDuration) {
  const timerBar = document.getElementById("timebar");
  const timerText = document.getElementById("timer-text");
  let timeLeft = duration;
  timerBar.style.width = "0%";

  timer = setInterval(() => {
    timeLeft--;
    const progress = ((duration - timeLeft) / duration) * 100;
    timerBar.style.width = progress + "%";

    // Update timer text
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerText.textContent = `Time Left: ${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Color changes based on progress
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    if (progress < 60) {
      timerBar.style.background = "linear-gradient(90deg, #6366f1, #8b5cf6)";
      timerText.style.color = isDarkMode ? "#ffffff" : "#333";
      timerText.style.fontWeight = "bold";
    } else if (progress < 90) {
      timerBar.style.background = "linear-gradient(90deg, #f59e0b, #d97706)";
      timerText.style.color = "#f59e0b";
      timerText.style.fontWeight = "bold";
    } else {
      // آخر دقيقة - يتحول أحمر
      timerBar.style.background = "linear-gradient(90deg, #ef4444, #dc2626)";
      timerText.style.color = "#ef4444";
      timerText.style.fontWeight = "bold";
      
      // تأثير وميض
      if (timeLeft % 2 === 0) {
        timerText.style.opacity = "1";
      } else {
        timerText.style.opacity = "0.5";
      }
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      endExam();
    }
  }, 1000);
}

// ====== DOM Elements ======
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");
const num = document.querySelector(".num");
const questionEl = document.querySelector(".question");
const choices = document.querySelectorAll(".option-section label");
const bookmarkedContainer = document.getElementById("bookmarkedQuestions");
const submitBtn = document.querySelector(".supmit");
const progressText = document.querySelector(".progress-text");
const questionPalette = document.getElementById("questionPalette");

// ====== Initialize Question Palette ======
function initializeQuestionPalette() {
  questionPalette.innerHTML = "";
  
  questions.forEach((_, index) => {
    const paletteItem = document.createElement("div");
    paletteItem.classList.add("palette-item", "unanswered");
    paletteItem.textContent = index + 1;
    paletteItem.dataset.index = index;
    
    paletteItem.addEventListener("click", () => {
      navigateToQuestion(index);
    });
    
    questionPalette.appendChild(paletteItem);
  });
  
  updateQuestionPalette();
}

// ====== Update Question Palette States ======
function updateQuestionPalette() {
  const paletteItems = document.querySelectorAll(".palette-item");
  
  paletteItems.forEach((item, index) => {
    // Reset classes
    item.classList.remove("current", "answered", "marked", "unanswered");
    
    // Check if answered
    const isAnswered = localStorage.getItem(`question_${currentUserEmail}_${index}`) !== null;
    
    // Check if marked
    const isMarked = favQuestion.includes(index);
    
    // Check if current
    const isCurrent = index === currentIndex;
    
    // Apply appropriate classes
    if (isCurrent) {
      item.classList.add("current");
    } else if (isAnswered) {
      item.classList.add("answered");
    } else {
      item.classList.add("unanswered");
    }
    
    if (isMarked) {
      item.classList.add("marked");
    }
  });
}

// ====== Progress Indicator Update ======
function updateProgressIndicator() {
  progressText.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  
  // Update progress bar
  const progressBar = document.getElementById("progress-bar");
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;
  progressBar.style.width = progressPercentage + "%";
}

// ====== Check if all questions answered ======
function checkAllAnswered() {
  let answeredCount = 0;
  for (let i = 0; i < questions.length; i++) {
    if (localStorage.getItem(`question_${currentUserEmail}_${i}`) !== null) {
      answeredCount++;
    }
  }
  
  // Enable/disable submit based on answered questions
  if (answeredCount === questions.length) {
    submitBtn.classList.remove("disabled");
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
  } else {
    submitBtn.classList.add("disabled");
    submitBtn.style.opacity = "0.5";
    submitBtn.style.cursor = "not-allowed";
  }
  
  // Update answered count display
  const answeredDisplay = document.querySelector(".answered-count");
  if (answeredDisplay) {
    answeredDisplay.textContent = `${answeredCount}/${questions.length} Answered`;
  }
}

// ====== Navigation and Show Question with Smooth Transition ======
function showQuestion(index) {
  // Add fade out effect
  const questionSection = document.querySelector(".question-section");
  questionSection.style.opacity = "0";
  questionSection.style.transform = "translateY(10px)";
  
  setTimeout(() => {
    const iconHTML = '<i class="fa-solid fa-star"></i>';
    questionEl.innerHTML = iconHTML + questions[index].question;

    choices.forEach((choice, i) => {
      choice.childNodes[0].nodeValue = questions[index].choices[i] + " ";
      const input = choice.querySelector("input");
      input.value = i;
      input.checked = false;
    });

    const savedAnswer = localStorage.getItem(`question_${currentUserEmail}_${index}`);
    if (savedAnswer != null) {
      choices[savedAnswer].querySelector("input").checked = true;
    }

    setupFavoriteIcon();
    updateFavoriteIcon();
    updateNavButtons();
    updateProgressIndicator();
    updateQuestionPalette();
    checkAllAnswered();
    
    // Fade in effect
    questionSection.style.opacity = "1";
    questionSection.style.transform = "translateY(0)";
  }, 200);
}

// ====== Store Answers ======
function storeAnswer() {
  const optionSelections = document.querySelectorAll(".option-section input");
  optionSelections.forEach((option) => {
    option.addEventListener("change", () => {
      localStorage.setItem(`question_${currentUserEmail}_${currentIndex}`, Number(option.value));
      updateQuestionPalette();
      checkAllAnswered();
      
      // Visual feedback
      const label = option.closest("label");
      label.style.transform = "scale(0.98)";
      setTimeout(() => {
        label.style.transform = "scale(1)";
      }, 100);
    });
  });
}

// ====== Favorite Questions with Highlight ======
function setupFavoriteIcon() {
  const favIcon = document.querySelector(".question i");
  favIcon.onclick = () => {
    const alreadyFav = favQuestion.includes(currentIndex);

    if (!alreadyFav) {
      favQuestion.push(currentIndex);
      const markBtn = document.createElement("div");
      markBtn.classList.add("mark-btn");
      markBtn.innerHTML = `<i class="fa-solid fa-bookmark"></i> Q${currentIndex + 1}`;
      markBtn.dataset.index = currentIndex;
      
      // Highlight marked question
      markBtn.classList.add("marked-question");
      
      markBtn.addEventListener("click", () =>
        navigateToQuestion(Number(markBtn.dataset.index))
      );
      bookmarkedContainer.appendChild(markBtn);
      
      // Animation
      markBtn.style.animation = "slideInRight 0.3s ease";
    } else {
      favQuestion = favQuestion.filter((i) => i !== currentIndex);
      const btnToRemove = bookmarkedContainer.querySelector(
        `.mark-btn[data-index="${currentIndex}"]`
      );
      if (btnToRemove) {
        btnToRemove.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => {
          bookmarkedContainer.removeChild(btnToRemove);
        }, 300);
      }
    }
    updateFavoriteIcon();
    updateQuestionPalette();
  };
}

function navigateToQuestion(index) {
  currentIndex = index;
  num.textContent = currentIndex + 1;
  showQuestion(currentIndex);
}

function updateFavoriteIcon() {
  const favIcon = document.querySelector(".question i");
  if (favQuestion.includes(currentIndex)) {
    favIcon.classList.add("favorited");
    favIcon.style.color = "#fbbf24";
    favIcon.style.transform = "scale(1.2)";
  } else {
    favIcon.classList.remove("favorited");
    favIcon.style.color = "";
    favIcon.style.transform = "scale(1)";
  }
}

// ====== Navigation Buttons Visibility ======
function updateNavButtons() {
  if (currentIndex === 0) {
    prev.style.opacity = "0.5";
    prev.style.pointerEvents = "none";
  } else {
    prev.style.opacity = "1";
    prev.style.pointerEvents = "auto";
  }

  if (currentIndex === questions.length - 1) {
    next.style.opacity = "0.5";
    next.style.pointerEvents = "none";
  } else {
    next.style.opacity = "1";
    next.style.pointerEvents = "auto";
  }
}

// ====== End Exam & Score ======
function calculateScore() {
  score = 0;
  for (let i = 0; i < questions.length; i++) {
    const userAnswer = localStorage.getItem(`question_${currentUserEmail}_${i}`);
    if (
      userAnswer !== null &&
      Number(userAnswer) === questions[i].correctAnswer
    ) {
      score++;
    }
  }
}

function endExam() {
  clearInterval(timer);
  calculateScore();

  const options = document.querySelectorAll(".option-section input");
  options.forEach((opt) => (opt.disabled = true));

  next.style.pointerEvents = "none";
  prev.style.pointerEvents = "none";

  const popup = document.querySelector(".popup");
  popup.style.display = "block";

  const popupText = document.querySelector(".popup-text");
  const popupButton = document.querySelector(".popup-button");
  
  // عدم عرض النتيجة في الـ popup
  popupText.textContent = "Time's Up! Exam Finished.";
  popupButton.textContent = "View Results";

  localStorage.setItem("finalScore", score);
  localStorage.setItem("totalQuestion", questions.length);

  popupButton.addEventListener("click", () => {
    location.replace("finishExam.html");
  });
}

// ====== Confirmation Popup Before Submit ======
function showConfirmationPopup() {
  const answeredCount = questions.filter((_, i) => 
    localStorage.getItem(`question_${currentUserEmail}_${i}`) !== null
  ).length;
  
  if (answeredCount < questions.length) {
    const unanswered = questions.length - answeredCount;
    const confirmMsg = `You have ${unanswered} unanswered question(s).\n\nAre you sure you want to submit?`;
    if (!confirm(confirmMsg)) {
      return false;
    }
  }
  
  // Create custom confirmation popup
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay";
  overlay.innerHTML = `
    <div class="confirm-box">
      <div class="confirm-icon">⚠️</div>
      <h3>Submit Exam?</h3>
      <p>You have answered <strong>${answeredCount}/${questions.length}</strong> questions.</p>
      <p style="color: #666; font-size: 14px;">Once submitted, you cannot change your answers.</p>
      <div class="confirm-buttons">
        <button class="confirm-btn cancel-btn" onclick="this.closest('.confirm-overlay').remove()">
          <i class="fa-solid fa-times"></i> Cancel
        </button>
        <button class="confirm-btn submit-btn" onclick="confirmSubmit()">
          <i class="fa-solid fa-check"></i> Submit
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Add styles for confirmation popup
  const style = document.createElement("style");
  style.textContent = `
    .confirm-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    }
    .confirm-box {
      background: white;
      padding: 30px;
      border-radius: 16px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      animation: scaleIn 0.3s ease;
    }
    body.dark-mode .confirm-box {
      background: #1e293b;
      color: #e2e8f0;
    }
    .confirm-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .confirm-box h3 {
      margin: 0 0 15px;
      color: #333;
      font-size: 24px;
    }
    body.dark-mode .confirm-box h3 {
      color: #e2e8f0;
    }
    .confirm-box p {
      margin: 10px 0;
      color: #555;
    }
    body.dark-mode .confirm-box p {
      color: #cbd5e1;
    }
    .confirm-buttons {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }
    .confirm-btn {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .cancel-btn {
      background: #e0e0e0;
      color: #555;
    }
    body.dark-mode .cancel-btn {
      background: #475569;
      color: #e2e8f0;
    }
    .cancel-btn:hover {
      background: #d0d0d0;
    }
    body.dark-mode .cancel-btn:hover {
      background: #64748b;
    }
    .submit-btn {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }
    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

window.confirmSubmit = function() {
  calculateScore();
  localStorage.setItem("finalScore", score);
  localStorage.setItem("totalQuestion", questions.length);
  location.replace("finishExam.html");
};

// ====== Event Listeners ======
next.addEventListener("click", () => {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    num.textContent = currentIndex + 1;
    showQuestion(currentIndex);
  }
});

prev.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    num.textContent = currentIndex + 1;
    showQuestion(currentIndex);
  }
});

// mark shortcut - مُصلح
const markShortcut = document.querySelector(".mark");
markShortcut.addEventListener("click", () => {
  const favIcon = document.querySelector(".question i");
  favIcon.click();
});

// submit with confirmation
submitBtn.addEventListener("click", () => {
  // Check if button is disabled
  if (submitBtn.classList.contains("disabled")) {
    alert("Please answer all questions before submitting!");
    return;
  }
  showConfirmationPopup();
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" && currentIndex < questions.length - 1) {
    next.click();
  } else if (e.key === "ArrowLeft" && currentIndex > 0) {
    prev.click();
  }
});

// ====== Initialize ======
initializeQuestionPalette();
showQuestion(currentIndex);
storeAnswer();
timerBar(timerDuration);
checkAllAnswered();

// Add CSS for smooth transitions
const transitionStyle = document.createElement("style");
transitionStyle.textContent = `
  .question-section {
    transition: all 0.3s ease;
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(20px);
      opacity: 0;
    }
  }
  
  .mark-btn.marked-question {
    background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
    box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
  }
  
  .mark-btn {
    width: 100%;
    background-color: rgba(255, 255, 255, 0.2);
    margin-bottom: 10px;
    padding: 14px 10px;
    font-weight: bold;
    border-radius: 12px;
    color: white;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .mark-btn:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }
`;
document.head.appendChild(transitionStyle);