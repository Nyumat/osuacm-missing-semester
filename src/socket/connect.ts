import { io } from "socket.io-client";

const socket = io("https://chatws-pkxd.onrender.com");

export function connect() {
  socket.on("connect", () => {
    console.log("Connected to the socket server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from the socket server.");
  });
}
export default socket;
