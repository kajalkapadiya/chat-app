import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./chatWindow.css";

const ChatWindow = ({ token }) => {
  const [users, setUsers] = useState([]); // Ensure users is an array
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  console.log(chatMessages);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = io("http://localhost:3001", {
      query: { token },
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("users", (data) => {
      if (Array.isArray(data.allUsers)) {
        setUsers(data.allUsers);
      } else {
        console.error("Received data format is not as expected:", data);
      }
    });

    socket.on("message", (message) => {
      setChatMessages((prevMessages) => [...prevMessages, message]);
    });

    setSocket(socket);

    fetchMessages();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchMessages = async () => {
    const response = await fetch("http://localhost:3000/api/messages");
    const data = await response.json();
    setChatMessages(data);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit("sendMessage", message);
      setMessage("");
    }
  };

  return (
    <div className="chat-window">
      <div className="user-list">
        <h3>Users</h3>
        <ul>
          {users.map((user) => (
            <li key={`${user.id}-${user.name}`}>{user.name}</li>
          ))}
        </ul>
      </div>
      <div className="chat-container">
        <div className="messages">
          {chatMessages.map((msg, index) => (
            <div key={index} className="message">
              <strong>{msg.userName}</strong>: {msg.message}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="message-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
