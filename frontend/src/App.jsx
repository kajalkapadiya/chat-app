// frontend/src/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import "./App.css";
import ChatWindow from "./components/ChatWindow";

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/chat" element={<ChatWindow />} />
    </Routes>
  );
}

export default App;
