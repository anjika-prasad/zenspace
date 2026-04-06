import { Link } from "react-router-dom";
import LofiGirl from "../components/LofiGirl";


function Home({user}) {
  return (
    <div className="home-container">
      {user && <p>Logged in as: {user.email}!!!!</p>}


      {/* Floating Blobs */}
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>

      {/* HERO SECTION */}
      <section className="hero">
  <div className="hero-left" data-aos="fade-right">
    <h1>Find Your Focus</h1>
    <p>Your calm and structured study space.</p>

    <div className="home-buttons">
      <Link to="/login" className="main-btn">
        Start Studying
      </Link>
      <Link to="/pomodoro" className="secondary-btn">Pomodoro </Link>
      <Link to="/rooms" className="secondary-btn">Study Rooms</Link>
      <Link to="/tasks" className="secondary-btn">Task Manager</Link>
      <Link to="/analytics" className="secondary-btn">View Analytics</Link>
    </div>
  </div>

  <div className="hero-right" data-aos="fade-left">
    <LofiGirl />
  </div>
</section>



      {/* FEATURES SECTION */}
      <section className="features">
        <div className="feature-card" data-aos="fade-up">
          <h3>⏳ Pomodoro</h3>
          <p>Structured focus sessions for productivity.</p>
        </div>

        <div className="feature-card" data-aos="fade-up">
          <h3>🎧 Lofi Mode</h3>
          <p>Calm background music for deep concentration.</p>
        </div>

        <div className="feature-card" data-aos="fade-up">
          <h3>📚 Study Rooms</h3>
          <p>Virtual co-study with accountability.</p>
        </div>
      </section>

      {/* WAVE */}
      <div className="wave">
        <svg viewBox="0 0 1440 320">
          <path
            fill="#ffffff30"
            d="M0,224L80,208C160,192,320,160,480,176C640,192,800,256,960,266.7C1120,277,1280,235,1360,213.3L1440,192V320H0Z"
          ></path>
        </svg>
      </div>

    </div>
  );
}

export default Home;
