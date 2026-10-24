import { useState, useEffect } from "react";
import './App.css';
import programmingData from './data/programming.json';
import generalKnowledgeData from './data/general-knowledge.json';
import currentAffairsData from './data/current-affairs.json';

// A QuizId is a union type: only these three strings are valid quiz IDs.
type QuizId =
  | 'programming-basics'
  | 'general-knowledge'
  | 'current-affairs';

// Each answer option has an ID (used internally) and text (shown to the user).
type QuizOption = {
  id: string;
  text: string;
};

// This shape matches the question objects in the  JSON files.
// `answer` should normally contain the correct option ID; the helper below
// also supports a JSON file that stores the exact correct option text instead.
type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  answer: string;
  explanation: string;
};

// Connect each quiz ID to the data imported from its JSON file.
const quizBanks: Record<QuizId, QuizQuestion[]> = {
  'programming-basics': programmingData,
  'general-knowledge': generalKnowledgeData,
  'current-affairs': currentAffairsData,
};
// Randomize the order of an array's items. This is used to shuffle thE QUESTIONS and the answer options so that the quiz is not always the same.
function shuffle<T,>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}


// Information for the quiz cards on the first screen.
const quizCards = [
  {
    id: 'programming-basics',
    title: 'Programming Basics',
    difficulty: 'BEGINNER',
    description: 'Test your coding knowledge and problem-solving skills.',
    icon: '</>',
  },
  {
    id: 'general-knowledge',
    title: 'General Knowledge',
    difficulty: 'BEGINNER',
    description: 'Explore science, history, geography and more.',
    icon: '?',
  },
  {
    id: 'current-affairs',
    title: 'Current Affairs',
    difficulty: 'INTERMEDIATE',
    description: 'Test your awareness of events around the world.',
    icon: '↗',
  },
] satisfies {
  id: QuizId;
  title: string;
  difficulty: string;
  description: string;
  icon: string;
}[];

/**
 * Finds the correct option for a question.
 * The usual data format is `answer: "option-id"`. Matching the option text too
 * makes the result screen more tolerant if a JSON file uses answer text instead.
 */
function getCorrectOption(question: QuizQuestion): QuizOption | undefined {
  const expectedAnswer = question.answer.trim().toLowerCase();

  return question.options.find(
    (option) =>
      option.id.trim().toLowerCase() === expectedAnswer ||
      option.text.trim().toLowerCase() === expectedAnswer
  );
}

/**
 * Checks whether a selected option is correct.
 * An unanswered question is never marked correct.
 */
function isAnswerCorrect(
  question: QuizQuestion,
  selectedOptionId: string | undefined
): boolean {
  if (!selectedOptionId) return false;

  const correctOption = getCorrectOption(question);

  // Prefer comparing IDs because IDs are what we save in React state.
  if (correctOption) {
    return selectedOptionId === correctOption.id;
  }

  // Fallback for data where the answer itself is an option ID not found above.
  return selectedOptionId.trim().toLowerCase() === question.answer.trim().toLowerCase();
}


function App() {
  // null means that no quiz has been selected yet.
  const [activeQuizId, setActiveQuizId] = useState<QuizId | null>(null);

  // Array indexes start at 0, so 0 means question 1 is currently displayed.
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Save answers as { questionId: selectedOptionId }.
  // Because answers are keyed by question ID, navigating away does not erase them.
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // This state switches from the question screen to the results screen.
  const [showResults, setShowResults] = useState(false);
// this state controls wthether the quiz setup screen is shown or not. It is initially set to false, meaning the quiz setup screen is hidden by default.
  const [showQuizSetup, setShowQuizSetup] = useState(false);
// this state controls whether negative marking is enabled or not. It is initially set to false, meaning negative marking is disabled by default.
  const [negativeMarking, setNegativeMarking] = useState(false);
// this state controls whether the timer is enabled or not. It is initially set to false, meaning the timer is disabled by default.
  const [timerEnabled, setTimerEnabled] = useState(false);
  // 5 minute stored in seconds as a state varibale so that its change is constantly updated in the screen
  const [ TimeRemaining, setTimeremaining] = useState(300);
  // this state stores the shuffled questions for the active quiz.
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  // dark mode storing it true means dark mode false is light mode 
  const [darkMode, setDarkMode] = useState(false);

  // Look up the selected quiz's question bank and its card metadata.
  const activeQuiz =  activeQuizId ? shuffledQuestions : null;
  const activeQuizInfo = quizCards.find((quiz) => quiz.id === activeQuizId);
  const currentQuestion = activeQuiz?.[currentQuestionIndex] ?? null;
  const quizIsRunning =Boolean(activeQuiz) && !showQuizSetup && !showResults;

  // ----- Score calculations -----
  // Count questions with a saved answer, regardless of whether it is correct.
  const answeredCount = activeQuiz
    ? activeQuiz.filter((question) => Boolean(answers[question.id])).length
    : 0;

  // Count correct responses by comparing the saved option ID with the answer key.
  const correctCount = activeQuiz
    ? activeQuiz.filter((question) =>
        isAnswerCorrect(question, answers[question.id])
      ).length
    : 0;

  // An answered question is incorrect only when it has an answer and that answer is wrong.
  const incorrectCount = activeQuiz
    ? activeQuiz.filter(
        (question) =>
          Boolean(answers[question.id]) &&
          !isAnswerCorrect(question, answers[question.id])
      ).length
    : 0;

  // Unanswered questions do not count as incorrect; they are reported separately.
  const unansweredCount = activeQuiz
    ? activeQuiz.length - answeredCount
    : 0;

// The score is the number of correct answers minus a penalty for incorrect answers if negative marking is enabled.
  const score =
  correctCount - (negativeMarking ? incorrectCount * 0.25 : 0);
  
  useEffect(() => {
  document.documentElement.dataset.theme =
    darkMode ? "dark" : "light";
}, [darkMode]);


 

  // Start a quiz and clear any answers/results left by a previous attempt.
  function startQuiz(quizId: QuizId) {
    setActiveQuizId(quizId);
    setShuffledQuestions(
    shuffle(quizBanks[quizId]).map(question => ({
      ...question,
      options: shuffle(question.options),
    }))
  );
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setShowQuizSetup(true);
  }

 

  // Save the user's selected option for the current question.
  function selectAnswer(optionId: string) {
    if (!currentQuestion) return;

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestion.id]: optionId,
    }));
  }

  // Return to the quiz-selection screen and reset the current attempt.
  function goBackToSelection() {
    setActiveQuizId(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
  }

  // Move back one question, but never allow an index below 0.
  function goToPreviousQuestion() {
    setCurrentQuestionIndex((previousIndex) => Math.max(0, previousIndex - 1));
  }

  // Move forward one question, but never move past the final question.
  function goToNextQuestion() {
    if (!activeQuiz) return;

    setCurrentQuestionIndex((previousIndex) =>
      Math.min(activeQuiz.length - 1, previousIndex + 1)
    );
  }

  // Jump straight to a question from the question overview.
  function goToQuestion(questionIndex: number) {
    if (!activeQuiz) return;

    const lastIndex = activeQuiz.length - 1;
    setCurrentQuestionIndex(Math.max(0, Math.min(lastIndex, questionIndex)));
  }

  // Submit the quiz. The score is derived from `answers`, so no separate score
  // state is needed and the result cannot get out of sync with the answers.
  function submitQuiz() {
    if (!activeQuiz || activeQuiz.length === 0) return;
    setShowResults(true);
  }

  // Retaking starts a fresh attempt of the same quiz.
  function retakeQuiz() {
    if (activeQuizId) startQuiz(activeQuizId);


  }

 // Remove the user's answer for the current question.
function removeAnswer() {
  if (!currentQuestion) return;

  setAnswers(previous => {
    const updated = { ...previous };
    delete updated[currentQuestion.id];
    return updated;
  });
}
useEffect(() => {
  if (!timerEnabled || !quizIsRunning) {
    return;
  }

  if (TimeRemaining <= 0) {
    setShowResults(true);
    return;
  }

  const timeoutId = window.setTimeout(() => {
    setTimeremaining(previousTime =>
      Math.max(previousTime - 1, 0)
    );
  }, 1000);

  return () => window.clearTimeout(timeoutId);
}, [timerEnabled, quizIsRunning, TimeRemaining]);

  // Handle the unlikely case that a quiz ID points to an empty question bank.
  if (activeQuizId && activeQuizInfo && activeQuiz?.length === 0) {
    return (
      <main className="app-shell">
        <header className="site-header">
          <button className="back-button" type="button" onClick={goBackToSelection}>
            ← All quizzes
          </button>
          <div className="brand">
            <span className="brand-mark">Q</span>
            <span>quizroom</span>
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(previous => !previous)}
              >
              {darkMode ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </header>
        <section className="empty-state">
          <h1>No questions found</h1>
          <p>This quiz does not contain any questions yet.</p>
          <button className="primary-button" type="button" onClick={goBackToSelection}>
            Back to quizzes
          </button>
        </section>
      </main>
    );
  }

  // RESULTS SCREEN: shown only after the user submits their attempt.
  if (activeQuiz && activeQuizInfo && showResults) {
    const resultTitle =
      score === 12
        ? 'Perfect score!'
        : score >= 10
          ? 'Excellent work!'
          : score >= 7
            ? 'Nice work!'
            : score >= 5
              ? 'Good effort!'
              : 'Keep practising!';

    return (
      <main className="app-shell">
        <header className="site-header">
          <button className="back-button" type="button" onClick={goBackToSelection}>
            ← All quizzes
          </button>

          <div className="brand">
            <span className="brand-mark">Q</span>
            <span>quizroom</span>
          </div>
          <button
              className="theme-toggle"
              onClick={() => setDarkMode(previous => !previous)}
              >
              {darkMode ? "Light mode" : "Dark mode"}
            </button>
        </header>

        <section className="results-screen">
          <div className="results-header">
            <p className="eyebrow">QUIZ COMPLETED</p>
            <h1>{resultTitle}</h1>
            <p className="results-subtitle">
              You finished <strong>{activeQuizInfo.title}</strong>. Here is how you did.
            </p>

            <div className="score-card" aria-label={`Your score is ${score} `}>
              <span className="score-number">{score}</span>
              <span className="score-label">YOUR SCORE</span>
              <p>
                {correctCount} of {activeQuiz.length} questions correct
              </p>
              <p className="score-label">
                {((score / activeQuiz.length) * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Summary cards make the three result categories easy to scan. */}
          <div className="score-metrics">
            <article className="metric-card metric-correct">
              <span className="metric-icon" aria-hidden="true">✓</span>
              <span className="metric-label">Correct</span>
              <strong className="metric-number">{correctCount}</strong>
            </article>

            <article className="metric-card metric-incorrect">
              <span className="metric-icon" aria-hidden="true">×</span>
              <span className="metric-label">Incorrect</span>
              <strong className="metric-number">{incorrectCount}</strong>
            </article>

            <article className="metric-card metric-unanswered">
              <span className="metric-icon" aria-hidden="true">—</span>
              <span className="metric-label">Unanswered</span>
              <strong className="metric-number">{unansweredCount}</strong>
            </article>
          </div>

          <div className="results-actions">
            <button className="secondary-button" type="button" onClick={goBackToSelection}>
              ← All quizzes
            </button>
            <button className="primary-button" type="button" onClick={retakeQuiz}>
              Retake quiz <span aria-hidden="true">↻</span>
            </button>
          </div>

          {/* Review every question so the user can learn from mistakes. */}
          <section className="review-section">
            <div className="review-heading">
              <div>
                <p className="eyebrow">LEARN FROM YOUR ATTEMPT</p>
                <h2>Answer review</h2>
              </div>
              <span className="review-count">{activeQuiz.length} questions</span>
            </div>

            <div className="review-list">
              {activeQuiz.map((question, index) => {
                const selectedOptionId = answers[question.id];
                const selectedOption = question.options.find(
                  (option) => option.id === selectedOptionId
                );
                const correctOption = getCorrectOption(question);
                const wasAnswered = Boolean(selectedOptionId);
                const wasCorrect = isAnswerCorrect(question, selectedOptionId);

                return (
                  <article className="review-card" key={question.id}>
                    <div className="review-card-top">
                      <span className="review-index">QUESTION {index + 1}</span>
                      <span
                        className={`review-status ${
                          !wasAnswered
                            ? 'status-unanswered'
                            : wasCorrect
                              ? 'status-correct'
                              : 'status-incorrect'
                        }`}
                      >
                        {!wasAnswered ? 'Unanswered' : wasCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <h3 className="review-question">{question.question}</h3>

                    <div className="review-answer-row">
                      <span className="review-answer-label">Your answer</span>
                      <span
                        className={`review-answer-value ${
                          !wasAnswered
                            ? 'selected-unanswered'
                            : wasCorrect
                              ? 'selected-correct'
                              : 'selected-wrong'
                        }`}
                      >
                        {selectedOption?.text ?? 'Not answered'}
                      </span>
                    </div>

                    <div className="review-answer-row">
                      <span className="review-answer-label">Correct answer</span>
                      <span className="review-answer-value correct-answer">
                        {correctOption?.text ?? question.answer}
                      </span>
                    </div>

                    {question.explanation && (
                      <div className="explanation-box">
                        <strong>Explanation</strong>
                        <p>{question.explanation}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <div className="results-bottom-actions">
            <button className="primary-button" type="button" onClick={retakeQuiz}>
              Try again <span aria-hidden="true">↻</span>
            </button>
          </div>
        </section>
      </main>
    );
  }
if (showQuizSetup && activeQuiz && currentQuestion) {
  return (
    <main className="app-shell">
      <header className="site-header">
        <button
          className="back-button"
          type="button"
          onClick={goBackToSelection}
        >
          ← All quizzes
        </button>

        <div className="brand">
          <span className="brand-mark">Q</span>
          <span>quizroom</span>
        </div>
        <button
              className="theme-toggle"
              onClick={() => setDarkMode(previous => !previous)}
              >
              {darkMode ? "Light mode" : "Dark mode"}
            </button>
      </header>

      <section className="quiz-setup-container">
        <div className="quiz-setup-card">
          <h1>Quiz Setup</h1>
          <p>Customize your quiz before you begin.</p>

          {/* Negative marking option */}
          <button
            className={`setup-option ${
              negativeMarking ? "selected" : ""
            }`}
            type="button"
            aria-pressed={negativeMarking}
            onClick={() =>
              setNegativeMarking(previous => !previous)
            }
          >
            <span>Negative marking</span>
            {negativeMarking && <span>✓</span>}
          </button>

          {/* Timer option */}
          <button
            className={`setup-option ${
              timerEnabled ? "selected" : ""
            }`}
            type="button"
            aria-pressed={timerEnabled}
            onClick={() =>
              setTimerEnabled(previous => !previous)
            }
          >
            <span>Five-minute timer</span>
            {timerEnabled && <span>✓</span>}
          </button>

          <button
            className="primary-button begin-quiz-button"
            type="button"
            onClick={() => {
                if (timerEnabled) {
                setTimeremaining(300);
                  }

                setShowQuizSetup(false);
                  }}
          >
            Begin Quiz →
          </button>
        </div>
      </section>
    </main>
  );
}
  // QUIZ SCREEN: the active quiz exists and the user has not submitted yet.
  if (activeQuiz && activeQuizInfo && currentQuestion) {
    const selectedOptionId = answers[currentQuestion.id];

    return (
      <main className="app-shell">
        <header className="site-header">
          <button
            className="back-button"
            type="button"
            onClick={goBackToSelection}
          >
            ← All quizzes
          </button>

          <div className="brand">
            <span className="brand-mark">Q</span>
            <span>quizroom</span>
          </div>
          <button
              className="theme-toggle"
              onClick={() => setDarkMode(previous => !previous)}
              >
              {darkMode ? "Light mode" : "Dark mode"}
            </button>
        </header>

        <section className="quiz-screen">
          <div className="quiz-topline">
            <div>
              <p className="eyebrow">NOW PLAYING</p>
              <h1 className="quiz-title">{activeQuizInfo.title}</h1>
              <p className="quiz-subtitle">{activeQuizInfo.difficulty}</p>
            </div>

            <span className="question-counter">
              {currentQuestionIndex + 1} / {activeQuiz.length}
            </span>
          </div>

         

          <div className="question-panel">
            <p className="question-label">QUESTION {currentQuestionIndex + 1}</p>
            {timerEnabled && (
            <p className="question-label">
            {String(Math.floor(TimeRemaining / 60)).padStart(2, "0")}:
            {String(TimeRemaining % 60).padStart(2, "0")}
             </p>
)}
            <h2 className="question-text">{currentQuestion.question}</h2>
            <p className="answer-hint">Select one answer.</p>

            <div className="answer-options">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`answer-option ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => selectAnswer(option.id)}
                  >
                    {/* Show familiar A/B/C/D labels while storing the option ID. */}
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="option-text">{option.text}</span>
                    <span className="option-check" aria-hidden="true">
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* A numbered overview lets the user jump around and see which questions have answers. */}
          <section className="question-map" aria-label="Question overview">
            <div className="question-map-heading">
              <h2>Question overview</h2>
              <p>{answeredCount} of {activeQuiz.length} answered</p>
            </div>

            <div className="question-map-buttons">
              {activeQuiz.map((question, index) => {
                const isAnswered = Boolean(answers[question.id]);
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button
                    key={question.id}
                    type="button"
                    className={`question-jump ${
                      isCurrent ? 'current' : ''
                    } ${isAnswered ? 'answered' : 'unanswered'}`}
                    onClick={() => goToQuestion(index)}
                    aria-label={`Go to question ${index + 1}${isAnswered ? ', answered' : ', unanswered'}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

           
          </section>

          <div className="quiz-navigation">
            <button
              className="secondary-button"
              type="button"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={removeAnswer}

              
            >
              Remove answer
            </button>
            

            {currentQuestionIndex < activeQuiz.length - 1 && (
              <button
              className="primary-button"
              type="button"
              onClick={goToNextQuestion}
              >
                 Next question →
              </button>
            )}

            <button
              className="primary-button submit-button"
              type="button"
              onClick={submitQuiz}
          >
              Submit quiz ✓
            </button> 
            
          </div>
        </section>
      </main>
    );
  }

  // QUIZ SELECTION SCREEN: shown when activeQuizId is null.
  return (
    <main className="app-shell">
      <header className="site-header">
        <button
              className="theme-toggle"
              onClick={() => setDarkMode(previous => !previous)}
              >
              {darkMode ? "Light mode" : "Dark mode"}
        </button>
        <div className="brand">
          <span className="brand-mark">Q</span>
          <span>quizroom</span>
        </div>
        

        <p className="header-note">A little challenge goes a long way.</p>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">QUIZ PLATFORM</p>
          <h1>Make curiosity count.</h1>
          <p className="hero-copy">
            Choose a topic, test what you know, and track your progress.
          </p>
        </div>
      </section>

      <section className="quiz-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PICK YOUR TOPIC</p>
            <h2>Choose your challenge</h2>
          </div>
          <span className="quiz-total">{quizCards.length} quizzes</span>
        </div>

        <div className="quiz-grid">
          {quizCards.map((quiz) => {
            const questionCount = quizBanks[quiz.id].length;

            return (
              <article className="quiz-card" key={quiz.id}>
                <div className="quiz-card-topline">
                  <span className="quiz-icon" aria-hidden="true">{quiz.icon}</span>
                  <span className="quiz-level">{quiz.difficulty}</span>
                </div>

                <h3>{quiz.title}</h3>
                <p className="quiz-description">{quiz.description}</p>

                <div className="quiz-meta">
                  <span>{questionCount} questions</span>
                </div>

                <button
                  className="start-quiz-button"
                  type="button"
                  onClick={() => startQuiz(quiz.id)}
                >
                  Start quiz <span aria-hidden="true">→</span>
                </button>
              </article>
            );
          })}
        </div>
      </section>

      
    </main>
  );
}

export default App;
