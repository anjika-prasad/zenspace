import { useState } from "react";
import { auth } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 🔐 LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      navigate("/"); // go to home
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        alert("User does not exist. Please sign up first.");
      } else if (error.code === "auth/wrong-password") {
        alert("Incorrect password.");
      } else {
        alert(error.message);
      }
    }
  };

  // 🆕 SIGN UP
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully!");
      navigate("/");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("User already exists. Please login.");
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome to ZenSpace</h2>

        <form>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* 🔥 TWO BUTTONS */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleSignup}>Sign Up</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;