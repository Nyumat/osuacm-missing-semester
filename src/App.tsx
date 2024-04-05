import { useEffect, useRef, useState } from "react";
import "./App.css";
import socket from "./socket/connect";

type User = {
  name: string;
  color: string;
};

interface Message {
  body: string;
  type: string;
  user: User;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([
    { name: "Matt", color: "red" },
    { name: "John", color: "blue" },
  ]);
  const [message, setMessage] = useState<Message | null>(null);
  const [color, setColor] = useState<string>("red");
  const [name, setName] = useState<string>("Matt");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<User>({ name: "", color: "" });

  useEffect(() => {
    socket.onAny((event, message) => {
      if (event === "message") {
        // prevent duplicate messages
        let duplicate = false;
        duplicate = messages.some((message) => message.body === message.body);
        if (!duplicate) {
          setMessages((messages) => [...messages, message]);
        } else {
          console.log("duplicate message");
        }
      } else return console.log(event, message);
    });
    return () => {
      socket.offAny((event, ...args) => {
        console.log(event, args);
      });
    };
  }, []);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("message-r", (message) => {
      if (message) {
        // prevent duplicate messages
        let duplicate = false;
        duplicate = messages.some((message) => message.body === message.body);
        if (!duplicate) {
          setMessages((messages) => [...messages, message]);
        } else {
          console.log("duplicate message");
        }
        setMessages((messages) => [...messages, message]);
      }
    });
  }, []);

  const sendMessage = (message: string) => {
    if (!currentUser) return;
    socket.emit("message", {
      body: message,
      type: "message",
      user: currentUser,
    });
  };

  const deleteAllMessagesForUser = (user: User) => {
    setMessages((messages) =>
      messages.filter((message) => message.user.name !== user.name)
    );
  };

  const deleteAllMessages = () => {
    setMessages([]);
  };

  const createUser = (name: string, color: string) => {
    setUsers((users: User[]) => [...users, { name, color }]);
  };

  const deleteUser = (name: string) => {
    setUsers((users) => users.filter((user) => user.name !== name));
    if (currentUser.name === name) setCurrentUser({ name: "", color: "" });
  };

  const handleCheck =
    (user: User) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setCurrentUser(user);
      } else {
        setCurrentUser({ name: "", color: "" });
      }
    };

  return (
    <>
      <div>
        <h1>Chat</h1>
        <div
          style={{
            display: "flex",
            justifyContent: "left",
            alignItems: "center",
            flexWrap: "wrap",
            flexDirection: "row",
            width: "100%",
            maxHeight: "60vh",
            overflow: "scroll",
          }}
        >
          {messages.map((message: Message, index: number) => {
            console.log(message);
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  flexWrap: "wrap",
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                <span
                  style={{ color: message.user.color, marginRight: "10px" }}
                >
                  {message.user.name}
                </span>
                <span>{message.body}</span>

                <div>
                  <button
                    style={{ marginLeft: "10px" }}
                    onClick={() => deleteAllMessagesForUser(message.user)}
                  >
                    Delete all messages for {message.user.name}
                  </button>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{ marginTop: "20px" }}>
          <button onClick={() => deleteAllMessages()}>
            Delete all messages
          </button>
        </div>

        {currentUser?.name && (
          <div>
            <h2>Send Message</h2>
            <input
              type="text"
              placeholder="Message"
              onChange={(event) =>
                setMessage({
                  body: event.target.value,
                  type: "message",
                  user: currentUser,
                })
              }
            />
            <button onClick={() => sendMessage(message?.body || "")}>
              Send message
            </button>
          </div>
        )}

        <div>
          <h2>Current user: {currentUser?.name}</h2>
          <h2>Current color: {currentUser?.color}</h2>
          <div>
            <h2>Users online</h2>
            {users.map((user: User, index: number) => (
              <div key={index}>
                <span style={{ color: user.color, marginRight: "10px" }}>
                  {user.name}
                </span>
                <input type="checkbox" onChange={handleCheck(user)} />
                <button onClick={() => deleteUser(user.name)}>
                  Delete user
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2>Create a user</h2>
          <input
            type="text"
            placeholder="Name"
            onChange={(event) => setName(event.target.value)}
          />
          <input
            type="text"
            placeholder="Color"
            onChange={(event) => setColor(event.target.value)}
          />
          <button onClick={() => createUser(name, color)}>Create user</button>
        </div>
      </div>
    </>
  );
}

export default App;
