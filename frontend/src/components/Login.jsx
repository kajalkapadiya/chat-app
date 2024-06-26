import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      console.log(data.token);
      console.log("User logged in successfully!");
      localStorage.setItem("token", data.token); // Store the token
      navigate("/chat");
    } else if (response.status === 404) {
      console.log("User not found");
    } else if (response.status === 401) {
      console.log("User not authorized");
    } else {
      console.log("Failed to login");
    }
  };

  const navigateToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">
          Login
        </button>
        <button onClick={navigateToSignup} className="signup-button">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Login;
