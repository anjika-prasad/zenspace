import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);
function Analytics({ tasks }) {
  const [displayTotal, setDisplayTotal] = useState(0);
  const [displayCompleted, setDisplayCompleted] = useState(0);
  const [displayRate, setDisplayRate] = useState(0);

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const completionRate =
    total === 0 ? 0 : Math.round((completed / total) * 100);
  const productivityScore =
  total === 0 ? 0 : Math.round((completed / total) * 100);
  const high = tasks.filter(t => t.priority === "High").length;
const medium = tasks.filter(t => t.priority === "Medium").length;
const low = tasks.filter(t => t.priority === "Low").length;

const data = {
  labels: ["High", "Medium", "Low"],
  datasets: [
    {
      label: "Tasks by Priority",
      data: [high, medium, low],
      backgroundColor: ["#ff4d6d", "#ffd166", "#06d6a0"],
    },
  ],
};
// 🗓 Weekly data (last 7 days)
const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
};

const last7Days = getLast7Days();

const weeklyCounts = last7Days.map(date =>
  tasks.filter(
    t =>
      t.completed &&
      t.completedAt &&
      t.completedAt.startsWith(date)
  ).length
);
const weeklyData = {
  labels: last7Days.map(d => d.slice(5)), // show MM-DD
  datasets: [
    {
      label: "Tasks Completed",
      data: weeklyCounts,
      borderColor: "#a18cd1",
      backgroundColor: "rgba(161,140,209,0.2)",
      tension: 0.4,
      fill: true,
    },
  ],
};
  // 🎯 Animated counter effect
  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start++;
      if (start <= total) setDisplayTotal(start);
      if (start <= completed) setDisplayCompleted(start);
      if (start <= completionRate) setDisplayRate(start);

      if (start > Math.max(total, completed, completionRate)) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [tasks]);

  return (
    <div className="analytics-container">
      <h2>Productivity Analytics</h2>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Tasks</h3>
          <p>{displayTotal}</p>
        </div>

        <div className="analytics-card">
          <h3>Completed</h3>
          <p>{displayCompleted}</p>
        </div>

        {/*<div className="analytics-card">
          <h3>Completion Rate</h3>
          <p>{displayRate}%</p>
        </div>*/}
      </div>
     <div className="circle-wrapper">
  <div
    className="circle"
    style={{
      background: `conic-gradient(
        #a18cd1 ${completionRate}%,
        rgba(255,255,255,0.2) ${completionRate}%
      )`
    }}
  >
    <span>{completionRate}%</span>
  </div>
</div>
<div style={{ width: "600px", margin: "60px auto" }}>
  <Line data={weeklyData} />
</div>
<div style={{ width: "400px", margin: "50px auto" }}>
  <Bar data={data} />
</div>
<div className="score-badge">
  Productivity Score: {productivityScore}
</div>
    </div>
  );
}

export default Analytics;