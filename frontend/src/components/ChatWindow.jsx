import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./chatWindow.css";

const ChatWindow = () => {
  const [users, setUsers] = useState([]); // Ensure users is an array
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
      setChatMessages((prevMessages) => {
        {
          const updatedMessages = [...prevMessages, message];
          localStorage.setItem(
            "chatMessages",
            JSON.stringify(updatedMessages.slice(-10))
          );
          return updatedMessages.slice(-10);
        }
      });
    });

    setSocket(socket);

    loadMessagesFromLocalStorage();

    const interval = setInterval(() => {
      fetchNewMessages();
    }, 1000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const loadMessagesFromLocalStorage = async () => {
    const storedMessages =
      JSON.parse(localStorage.getItem("chatMessages")) || [];
    setChatMessages(storedMessages);
    const lastMessageTimestamp =
      storedMessages.length > 0
        ? new Date(storedMessages[storedMessages.length - 1].timestamp)
        : null;
    fetchNewMessages(lastMessageTimestamp);
  };

  const fetchNewMessages = async (lastMessageTimestamp) => {
    const url = lastMessageTimestamp
      ? `http://localhost:3000/api/messages?since=${lastMessageTimestamp.toISOString()}`
      : "http://localhost:3000/api/messages";

    const response = await fetch(url, { credentials: "include" });
    const data = await response.json();
    setChatMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, ...data];
      localStorage.setItem(
        "chatMessages",
        JSON.stringify(updatedMessages.slice(-10))
      );
      return updatedMessages.slice(-10);
    });
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
            <li key={`${user.id}-${user.name}`}>{user.name} joined</li>
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
