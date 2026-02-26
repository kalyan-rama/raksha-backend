// src/services/socket.js

import { io } from "socket.io-client";

export const socket = io(
  "https://raksha-backend-2rnb.onrender.com",
  {
    transports: ["websocket"],
    secure: true,
  }
);