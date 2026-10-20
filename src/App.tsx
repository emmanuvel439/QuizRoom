import './App.css';
function  App(){
  return (
  <main className="app-shell">
    <header className="site-header">
      <div className="brand">
        <span className="brand-mark">Q</span>
        <span>quizroom</span>
      </div>
      <p className="header-note">A little challenge goes a long way.</p>
    </header>
    <section className="hero">
      <p className="eyebrow">QUIZ PLATFORM</p>
      <h1>Make curiosity count.</h1>
      <p className="hero-copy">
      Choose a topic, test what you know, and track your progress.
      </p>
    </section>
    <section className="quiz-section">
      <div className="section-heading">
        <p className="eyebrow">PICK YOUR TOPIC</p>
        <h2>Choose your challenge</h2>
      </div>
      <div className="quiz-grid">
        <article className="quiz-card">
          <span className="quiz-icon">?</span>
          <p className="quiz-level">BEGINNER</p>
          <h3>General Knowledge</h3>
          <p className="quiz-description">
          Explore science, history, geography and more.
          </p>
          <div className="quiz-meta">
            <span>10 questions</span>
            <span>5 min</span>
          </div>
          <button className="start-quiz-button" type="button">
            Start quiz <span aria-hidden="true">→</span>
          </button>
        </article>

        <article className="quiz-card">
          <span className="quiz-icon">↗</span>
          <p className="quiz-level">INTERMEDIATE</p>
          <h3>Current Affairs</h3>
          <p className="quiz-description">
            Test your awareness of recent events around the world.
          </p>
          <div className="quiz-meta">
            <span>10 questions</span>
            <span>5 min</span>
          </div>
          <button className="start-quiz-button" type="button">
            Start quiz <span aria-hidden="true">→</span>
           </button>
        </article>
        <article className="quiz-card">
          <span className="quiz-icon">{"</>"}</span>
          <p className="quiz-level">BEGINNER</p>
          <h3>Programming Basics</h3>
          <p className="quiz-description">
           Test your coding knowledge and problem-solving skills.
          </p>
          <div className="quiz-meta">
            <span>10 questions</span>
            <span>5 min</span>
          </div>
          <button className="start-quiz-button" type="button">
              Start quiz <span aria-hidden="true">→</span>
          </button>
        </article>
      </div>
    </section>
  </main>   



  );

}
export default App