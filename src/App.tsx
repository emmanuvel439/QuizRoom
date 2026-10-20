import { useState } from 'react';
import './App.css';

import programmingData from './data/programming.json';
import generalKnowledgeData from './data/general-knowledge.json';
import currentAffairsData from './data/current-affairs.json';

type QuizId =
  | 'programming-basics'
  | 'general-knowledge'
  | 'current-affairs';

type QuizOption = {
  id: string;
  text: string;
};

type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  answer: string;
  explanation: string;
};

const quizBanks: Record<QuizId, QuizQuestion[]> = {
  'programming-basics': programmingData,
  'general-knowledge': generalKnowledgeData,
  'current-affairs': currentAffairsData,
};

const quizCards = [
  {
    id: 'programming-basics',
    title: 'Programming Basics',
    difficulty: 'BEGINNER',
    description: 'Test your coding knowledge and problem-solving skills.',
    icon: '</>',
    duration: '5 min',
  },
  {
    id: 'general-knowledge',
    title: 'General Knowledge',
    difficulty: 'BEGINNER',
    description: 'Explore science, history, geography and more.',
    icon: '?',
    duration: '5 min',
  },
  {
    id: 'current-affairs',
    title: 'Current Affairs',
    difficulty: 'INTERMEDIATE',
    description: 'Test your awareness of events around the world.',
    icon: '↗',
    duration: '5 min',
  },
] satisfies {
  id: QuizId;
  title: string;
  difficulty: string;
  description: string;
  icon: string;
  duration: string;
}[];

function App() {
  const [activeQuizId, setActiveQuizId] =
    useState<QuizId | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  const activeQuiz = activeQuizId
    ? quizBanks[activeQuizId]
    : null;

  const activeQuizInfo = quizCards.find(
    (quiz) => quiz.id === activeQuizId
  );

  const currentQuestion =
    activeQuiz?.[currentQuestionIndex] ?? null;

  function startQuiz(quizId: QuizId) {
    setActiveQuizId(quizId);
    setCurrentQuestionIndex(0);
    setAnswers({});
  }

  function selectAnswer(optionId: string) {
    if (!currentQuestion) return;

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestion.id]: optionId,
    }));
  }

  function goBackToSelection() {
    setActiveQuizId(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
  }

  function goToPreviousQuestion() {
    setCurrentQuestionIndex((previousIndex) =>
      Math.max(0, previousIndex - 1)
    );
  }

  function goToNextQuestion() {
    if (!activeQuiz) return;

    setCurrentQuestionIndex((previousIndex) =>
      Math.min(activeQuiz.length - 1, previousIndex + 1)
    );
  }

  // QUIZ SCREEN
  if (activeQuiz && activeQuizInfo && currentQuestion) {
    const progress =
      ((currentQuestionIndex + 1) / activeQuiz.length) * 100;

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
        </header>

        <section className="quiz-screen">
          <div className="quiz-topline">
            <div>
              <p className="eyebrow">NOW PLAYING</p>
              <h1 className="quiz-title">
                {activeQuizInfo.title}
              </h1>
            </div>

            <span className="question-counter">
              {currentQuestionIndex + 1} / {activeQuiz.length}
            </span>
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin={0}
            aria-valuemax={activeQuiz.length}
            aria-valuenow={currentQuestionIndex + 1}
          >
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="question-panel">
            <p className="question-label">
              QUESTION {currentQuestionIndex + 1}
            </p>

            <h2 className="question-text">
              {currentQuestion.question}
            </h2>

            <p className="answer-hint">
              Select one answer.
            </p>

            <div className="answer-options">
              {currentQuestion.options.map((option) => {
                const isSelected =
                  answers[currentQuestion.id] === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`answer-option ${
                      isSelected ? 'selected' : ''
                    }`}
                    aria-pressed={isSelected}
                    onClick={() => selectAnswer(option.id)}
                  >
                    <span className="option-letter">
                      {option.id}
                    </span>

                    <span className="option-text">
                      {option.text}
                    </span>

                    <span
                      className="option-check"
                      aria-hidden="true"
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="quiz-navigation">
            <button
              className="secondary-button"
              type="button"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>

            {currentQuestionIndex < activeQuiz.length - 1 ? (
              <button
                className="primary-button"
                type="button"
                onClick={goToNextQuestion}
              >
                Next question →
              </button>
            ) : (
              <button
                className="primary-button submit-button"
                type="button"
                disabled
                title="Results functionality will be added next"
              >
                Submit quiz
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }

  // QUIZ SELECTION SCREEN
  return (
    <main className="app-shell">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">Q</span>
          <span>quizroom</span>
        </div>

        <p className="header-note">
          A little challenge goes a long way.
        </p>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">QUIZ PLATFORM</p>

          <h1>Make curiosity count.</h1>

          <p className="hero-copy">
            Choose a topic, test what you know, and track
            your progress.
          </p>
        </div>
      </section>

      <section className="quiz-section">
        <div className="section-heading">
          <p className="eyebrow">PICK YOUR TOPIC</p>
          <h2>Choose your challenge</h2>
        </div>

        <div className="quiz-grid">
          {quizCards.map((quiz) => {
            const questionCount = quizBanks[quiz.id].length;

            return (
              <article className="quiz-card" key={quiz.id}>
                <span className="quiz-icon" aria-hidden="true">
                  {quiz.icon}
                </span>

                <p className="quiz-level">
                  {quiz.difficulty}
                </p>

                <h3>{quiz.title}</h3>

                <p className="quiz-description">
                  {quiz.description}
                </p>

                <div className="quiz-meta">
                  <span>{questionCount} questions</span>
                  <span>{quiz.duration}</span>
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