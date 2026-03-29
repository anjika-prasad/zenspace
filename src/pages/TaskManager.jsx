import { useState, useEffect } from "react";
import { db, auth } from "../services/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

function TaskManager({ tasks, setTasks }) {
  const [task, setTask] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Assignment");
  const [selectedPriority, setSelectedPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  // ✅ REAL-TIME FETCH FROM FIREBASE
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(
      collection(db, "users", user.uid, "tasks"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(data);
      }
    );

    return () => unsub();
  }, []);

  // ✅ ADD TASK (FIREBASE)
  const addTask = async () => {
    if (task.trim() === "") return;

    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "users", user.uid, "tasks"), {
      text: task,
      completed: false,
      category: selectedCategory,
      priority: selectedPriority,
      dueDate: dueDate,
    });

    setTask("");
    setDueDate("");
  };

  // ✅ TOGGLE TASK (FIREBASE)
  const toggleTask = async (id, currentStatus) => {
    const user = auth.currentUser;
    if (!user) return;

    const taskRef = doc(db, "users", user.uid, "tasks", id);

    await updateDoc(taskRef, {
      completed: !currentStatus,
      completedAt: !currentStatus ? new Date().toISOString() : null,
    });
  };

  // ✅ DELETE TASK (FIREBASE)
  const deleteTask = async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    await deleteDoc(doc(db, "users", user.uid, "tasks", id));
  };

  // ✅ Progress calculation
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progress =
    tasks.length === 0 ? 0 : (completedTasks / tasks.length) * 100;

  // ✅ Today's date
  const today = new Date().toISOString().split("T")[0];

  // ✅ Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className="task-container">
      <div className="task-card">
        <h2>Task Manager</h2>

        {/* Progress Bar */}
        <div className="progress-wrapper">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p>
            {completedTasks} / {tasks.length} Completed
          </p>
        </div>

        {/* INPUT */}
        <div className="task-input">
          <input
            type="text"
            placeholder="Add a new task..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option>Assignment</option>
            <option>Personal</option>
            <option>Hackathon</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <button onClick={addTask}>Add</button>
        </div>

        {/* TASK LIST */}
        <ul className="task-list">
          {sortedTasks.map((t) => (
            <li
              key={t.id}
              className={`task-item 
                ${t.completed ? "completed" : ""} 
                ${t.priority.toLowerCase()}
                ${
                  t.dueDate &&
                  t.dueDate < today &&
                  !t.completed
                    ? "overdue"
                    : ""
                }`}
            >
              <div
                onClick={() => toggleTask(t.id, t.completed)}
                className="task-content"
              >
                <strong>{t.text}</strong>
                <p>
                  {t.category} | Due: {t.dueDate || "No date"}
                </p>
              </div>

              <button onClick={() => deleteTask(t.id)}>❌</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TaskManager;