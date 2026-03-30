import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import { useLocation } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// 🔥 Firebase
import { db, auth } from "../services/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Pomodoro() {
  const BREAK_TIME = 5 * 60;

  const location = useLocation();
  const room = location.state?.room;

  // 🔥 ROOM ID
  const roomId = room?.name?.replace(/\s/g, "") || "global";

  // 🔥 Focus time
  let focusMinutes = 25;
  if (room?.name === "Exam Mode") focusMinutes = 50;
  if (room?.name === "Silent Library") focusMinutes = 45;
  if (room?.name === "Lofi Cafe") focusMinutes = 25;

  const FOCUS_TIME = focusMinutes * 60;

  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);

  const [streak, setStreak] = useState(
    parseInt(localStorage.getItem("streak")) || 0
  );
  const [lastDate, setLastDate] = useState(
    localStorage.getItem("lastDate") || null
  );

  const [weeklyData, setWeeklyData] = useState(
    JSON.parse(localStorage.getItem("weeklyData")) || [0,0,0,0,0,0,0]
  );

  const [width, height] = useWindowSize();

  // 💬 CHAT
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // 🔥 REAL-TIME CHAT
  useEffect(() => {
    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("createdAt")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsub();
  }, [roomId]);

  // 🔥 SEND MESSAGE
  const sendMessage = async () => {
    if (input.trim() === "") return;

    const user = auth.currentUser;

    await addDoc(collection(db, "rooms", roomId, "messages"), {
      text: input,
      user: user?.email || "Anon",
      createdAt: new Date(),
    });

    setInput("");
  };

  // 👥 USER PRESENCE (IMPORTANT FOR STUDYROOMS COUNT)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "rooms", roomId, "users", user.uid);

    // JOIN
    setDoc(userRef, {
      email: user.email,
    });

    // LEAVE
    return () => {
      deleteDoc(userRef);
    };
  }, [roomId]);

  // ⏱ TIMER
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0) {
      const audio = new Audio("/notification.mp3");
      audio.play();

      if (!isBreak) {
        setSessions((prev) => prev + 1);

        const todayIndex = new Date().getDay();
        const updatedWeekly = [...weeklyData];
        updatedWeekly[todayIndex] += 1;

        setWeeklyData(updatedWeekly);
        localStorage.setItem("weeklyData", JSON.stringify(updatedWeekly));

        const today = new Date().toDateString();

        if (lastDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          if (today === lastDate) {
          } else if (lastDate === yesterday.toDateString()) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            localStorage.setItem("streak", newStreak);
          } else {
            setStreak(1);
            localStorage.setItem("streak", 1);
          }
        } else {
          setStreak(1);
          localStorage.setItem("streak", 1);
        }

        localStorage.setItem("lastDate", today);
        setLastDate(today);

        setIsBreak(true);
        setTimeLeft(BREAK_TIME);
      } else {
        setIsBreak(false);
        setTimeLeft(FOCUS_TIME);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak]);

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(FOCUS_TIME);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const totalTime = isBreak ? BREAK_TIME : FOCUS_TIME;
  const progress = (timeLeft / totalTime) * 100;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

  return (
    <div className={`pomodoro-container`}>
      <div className="pomodoro-card">
        <h2>
          {room?.name ? `${room.name} Room` : "Focus Session"}
        </h2>
        <h3>{isBreak ? "Break Time" : "Focus Time"}</h3>

        {/* TIMER */}
        <div className="progress-ring">
          <svg width="220" height="220">
            <circle
              stroke="rgba(255,255,255,0.2)"
              fill="transparent"
              strokeWidth="10"
              r={radius}
              cx="110"
              cy="110"
            />
            <circle
              stroke="white"
              fill="transparent"
              strokeWidth="10"
              r={radius}
              cx="110"
              cy="110"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          <div className="timer-text">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="pomodoro-buttons">
          <button onClick={() => setIsActive(true)}>Start</button>
          <button onClick={() => setIsActive(false)}>Pause</button>
          <button onClick={resetTimer}>Reset</button>
        </div>

        <p>Sessions Completed: {sessions}</p>
        <p>Daily Streak: {streak}</p>

        {streak === 7 && (
          <Confetti width={width} height={height} />
        )}

        {/* GRAPH */}
        <div className="weekly-graph">
          <Bar
            data={{
              labels: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
              datasets: [
                {
                  data: weeklyData,
                  backgroundColor: "rgba(255,255,255,0.6)",
                },
              ],
            }}
          />
        </div>
        {/* 🎧 MUSIC PLAYER */}
<div className="music-player">
  {room?.name === "Lofi Cafe" && (
    <iframe
      src="https://www.youtube.com/embed/jfKfPfyJRdk"
      title="Lofi Music"
      width="100%"
      height="200"
      allow="autoplay"
    ></iframe>
  )}

  {room?.name === "Silent Library" && (
    <iframe
      src="https://www.youtube.com/embed/mPZkdNFkNps"
      title="Rain Sounds"
      width="100%"
      height="200"
      allow="autoplay"
    ></iframe>
  )}

  {!room && (
    <iframe
      src="https://open.spotify.com/embed/playlist/37i9dQZF1DX8NTLI2TtZa6"
      width="100%"
      height="80"
      allow="autoplay"
    ></iframe>
  )}
</div>

        {/* 💬 CHAT */}
        {room && (
  <div className="chat-panel">
    <h3>Room Chat</h3>

    <div className="chat-messages">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`chat-message ${
            msg.user === auth.currentUser?.email ? "you" : "other"
          }`}
        >
          <strong>{msg.user}</strong>: {msg.text}
        </div>
      ))}
    </div>

    <div className="chat-input">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  </div>
)}
      </div>
    </div>
  );
}

export default Pomodoro;