// <div className="chat-window">
//   <div className="user-list">
//     <h3>Users</h3>
//     <ul>
//       {users.map((user) => (
//         <li key={`${user.id}-${user.name}`}>{user.name} joined</li>
//       ))}
//     </ul>
//   </div>
//   <div className="chat-container">
//     <div className="messages">
//       {chatMessages.map((msg, index) => (
//         <div key={index} className="message">
//           <strong>{msg.userName}</strong>: {msg.message}
//         </div>
//       ))}
//     </div>
//     <form onSubmit={sendMessage} className="message-input">
//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         placeholder="Type a message..."
//       />
//       <button type="submit">Send</button>
//     </form>
//   </div>
// </div>
