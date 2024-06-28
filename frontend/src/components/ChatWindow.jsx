import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./chatWindow.css";
import { jwtDecode } from "jwt-decode";

const ChatWindow = () => {
  const [groups, setGroups] = useState([]); // List of groups user is part of
  const [currentGroup, setCurrentGroup] = useState(null); // Currently selected group
  const [users, setUsers] = useState([]); // Users in the current group
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  console.log(groups);
  console.log(currentGroup);
  console.log(users);
  console.log(socket);
  console.log(chatMessages);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const { id } = jwtDecode(token);
      localStorage.setItem("userId", id);
      const socket = io("http://localhost:3001", {
        query: { token },
      });

      socket.on("connect", () => {
        console.log("Connected to server");
      });

      socket.on("groups", (data) => {
        setGroups(data.groups);
        console.log(data.groups);
      });

      socket.on("groupMembers", (data) => {
        setUsers(data.members || []);
      });

      socket.on("message", (message) => {
        setChatMessages((prevMessages) => [...prevMessages, message]);
      });

      setSocket(socket);
    }
    const interval = setInterval(() => {
      if (currentGroup) {
        fetchGroupMessages(currentGroup._id);
      }
    }, 1000);
    return () => {
      if (socket) {
        clearInterval(interval);
        socket.disconnect();
      }
    };
  }, [currentGroup]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit("sendMessage", {
        groupId: currentGroup._id,
        message: message,
      });
      setMessage("");
    }
  };

  const createGroup = async () => {
    const userId = localStorage.getItem("userId");
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

  const fetchGroupMessages = async (groupId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:3000/api/groupMessages?groupId=${groupId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      const messages = await response.json();
      setChatMessages(messages);
    }
  };

  const handleGroupSelect = async (group) => {
    setCurrentGroup(group);
    socket.emit("getGroupMembers", group._id); // Request group members
    fetchGroupMessages(group._id); // Fetch messages when group is selected
  };

  return (
    <div className="chat-window">
      <div className="group-list">
        <h3>Groups</h3>
        <ul>
          {groups.map((group) => (
            <li
              key={group._id}
              onClick={() => handleGroupSelect(group)}
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
