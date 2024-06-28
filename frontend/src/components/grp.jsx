import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import jwtDecode from "jwt-decode";
import "./chatWindow.css";

const ChatWindow = () => {
  const [groups, setGroups] = useState([]); // List of groups user is part of
  const [currentGroup, setCurrentGroup] = useState(null); // Currently selected group
  const [users, setUsers] = useState([]); // Users in the current group
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const { userId } = jwtDecode(token);
      localStorage.setItem("userId", userId); // Save the userId to localStorage

      const socket = io("http://localhost:3001", {
        query: { token },
      });

      socket.on("connect", () => {
        console.log("Connected to server");
      });

      socket.on("groups", (data) => {
        console.log("Received groups:", data.groups);
        setGroups(data.groups);
      });

      socket.on("users", (data) => {
        setUsers(data.allUsers || []);
      });

      socket.on("message", (message) => {
        if (message.groupId === currentGroup?._id) {
          setChatMessages((prevMessages) => [...prevMessages, message]);
        }
      });

      setSocket(socket);
    }
  }, [currentGroup]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit("sendMessage", { groupId: currentGroup._id, text: message });
      setMessage("");
    }
  };

  const createGroup = async () => {
    const userId = localStorage.getItem("userId");
    console.log(userId);
    const response = await fetch("http://localhost:3000/createGroup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName, userId }),
    });

    if (response.ok) {
      const newGroup = await response.json(); // Assuming the backend returns the created group
      setGroups((prevGroups) => [...prevGroups, newGroup]);
      setCurrentGroup(newGroup); // Set the newly created group as the current group
      setNewGroupName(""); // Clear the input
    }
  };

  const joinGroup = async () => {
    const userId = localStorage.getItem("userId");
    const response = await fetch("http://localhost:3000/joinGroup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: joinGroupId, userId }),
    });

    if (response.ok) {
      const joinedGroup = await response.json(); // Assuming the backend returns the joined group
      setGroups((prevGroups) => [...prevGroups, joinedGroup]);
      setCurrentGroup(joinedGroup); // Set the joined group as the current group
      setJoinGroupId(""); // Clear the input
    }
  };

  return (
    <div className="chat-window">
      <div className="group-list">
        <h3>Groups</h3>
        <ul>
          {groups.map((group) => (
            <li
              key={group._id}
              onClick={() => setCurrentGroup(group)}
              className={
                currentGroup && currentGroup._id === group._id ? "active" : ""
              }
            >
              {group.name}
            </li>
          ))}
        </ul>
        <div className="group-actions">
          <input
            type="text"
            placeholder="New group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button onClick={createGroup}>Create Group</button>
          <input
            type="text"
            placeholder="Join group ID"
            value={joinGroupId}
            onChange={(e) => setJoinGroupId(e.target.value)}
          />
          <button onClick={joinGroup}>Join Group</button>
        </div>
      </div>
      <div className="chat-container">
        {currentGroup ? (
          <>
            <div className="user-list">
              <h3>Users</h3>
              <ul>
                {users.map((user) => (
                  <li key={user._id}>{user.name}</li>
                ))}
              </ul>
            </div>
            <div className="messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className="message">
                  <strong>{msg.userName}</strong>: {msg.text}
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
          </>
        ) : (
          <div className="no-group-selected">
            Select a group to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
