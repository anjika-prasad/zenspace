import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AOS from "aos";
import "aos/dist/aos.css";
import emailjs from "emailjs-com";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Pomodoro from "./pages/Pomodoro";
import TaskManager from "./pages/TaskManager";
import Analytics from "./pages/Analytics";
import StudyRooms from "./pages/StudyRooms";

function App() {
  const [tasks, setTasks] = useState(
    JSON.parse(localStorage.getItem("tasks")) || []
  );

  const [user, setUser] = useState(null);

  // 🔥 SEND EMAIL
  const sendReminder = (taskText, userEmail) => {
    emailjs.send(
      "service_only2uu",
      "template_xlklvnk",
      {
        task: taskText,
        to_email: userEmail,
      },
      "dd3zU3MT6J7FRNlKf" 
    );
  };

  // 🔥 CHECK TASKS FOR REMINDERS
  useEffect(() => {
    if (!auth.currentUser) return;

    const today = new Date().toISOString().split("T")[0];

    tasks.forEach((t) => {
      if (
        t.priority === "High" &&
        t.dueDate === today &&
        !t.reminded
      ) {
        sendReminder(t.text, auth.currentUser.email);

        // ✅ update state properly
        setTasks((prev) =>
          prev.map((task) =>
            task.id === t.id ? { ...task, reminded: true } : task
          )
        );
      }
    });
  }, [tasks]);

  // AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // localStorage sync
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // auth listener
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

        <Route
          path="/tasks"
          element={<TaskManager tasks={tasks} setTasks={setTasks} />}
        />

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