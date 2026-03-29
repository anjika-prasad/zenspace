import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AOS from "aos";
import "aos/dist/aos.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Pomodoro from "./pages/Pomodoro";
import TaskManager from "./pages/TaskManager";
import Analytics from "./pages/Analytics";
import StudyRooms from "./pages/StudyRooms";

function App() {
  // ✅ LIFT TASK STATE HERE
  const [tasks, setTasks] = useState(
    JSON.parse(localStorage.getItem("tasks")) || []
  );

  const [user, setUser] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // ✅ Keep localStorage synced
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
  const unsub = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  return () => unsub();
}, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pomodoro" element={<Pomodoro />} />

        {/* Pass tasks as props */}
        <Route
          path="/tasks"
          element={<TaskManager tasks={tasks} setTasks={setTasks} />}
        />

        {/* Analytics page */}
        <Route
          path="/analytics"
          element={<Analytics tasks={tasks} />}
        />
        <Route path="/rooms" element={<StudyRooms />} />
      </Routes>
    </Router>
  );
}

export default App;
