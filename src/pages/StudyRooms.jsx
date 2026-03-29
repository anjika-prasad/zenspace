import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";

function StudyRooms() {
  const navigate = useNavigate();

  // 🔥 Store live counts
  const [roomCounts, setRoomCounts] = useState({});

  // 🔥 Fetch real-time user counts
  useEffect(() => {
    const roomsList = ["SilentLibrary", "LofiCafe", "ExamMode"];

    const unsubscribes = roomsList.map((roomId) =>
      onSnapshot(collection(db, "rooms", roomId, "users"), (snapshot) => {
        setRoomCounts((prev) => ({
          ...prev,
          [roomId]: snapshot.size,
        }));
      })
    );

    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  // 🔥 Updated rooms (with IDs)
  const rooms = [
    {
      name: "Silent Library",
      id: "SilentLibrary",
      focus: "Deep Work • No Distractions",
    },
    {
      name: "Lofi Cafe",
      id: "LofiCafe",
      focus: "Chill Beats • Relaxed Focus",
    },
    {
      name: "Exam Mode",
      id: "ExamMode",
      focus: "High Intensity • 50/10 Cycles",
    },
  ];

  return (
    <div className="rooms-container">
      <h2>Study Rooms</h2>

      <div className="rooms-grid">
        {rooms.map((room, index) => (
          <div key={index} className="room-card">
            <h3>{room.name}</h3>
            <p>{room.focus}</p>

            {/* 🔥 REAL-TIME COUNT */}
            <p>👥 {roomCounts[room.id] || 0} studying</p>

            <button
              onClick={() =>
                navigate("/pomodoro", { state: { room } })
              }
            >
              Join Room
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudyRooms;