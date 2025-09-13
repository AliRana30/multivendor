import http from "http";
import express from "express";
import { Server } from "socket.io"; 
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*", 
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Socket.IO Server is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

let users = [];
const messages = {};

const addUser = (userId, socketId) => {
  const existingUserIndex = users.findIndex(user => user.userId === userId);
  
  if (existingUserIndex !== -1) {
    users[existingUserIndex].socketId = socketId;
  } else {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter(user => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find(user => user.userId === userId);
};

const createMessage = ({ senderId, receiverId, text, images = [], conversationId }) => {
  return {
    senderId,
    receiverId,
    text,
    images,
    conversationId,
    seen: false,
    timestamp: new Date()
  };
};

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    if (!userId) return;
    
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", (data) => {
    const { senderId, receiverId, text, message, images, conversationId } = data;
    
    if (!senderId || !receiverId || !conversationId) {
      socket.emit("error", { message: "Missing required fields" });
      return;
    }

    const messageText = text || message;
    if (!messageText?.trim()) {
      socket.emit("error", { message: "Message cannot be empty" });
      return;
    }
    
    const messageData = createMessage({
      senderId,
      receiverId,
      text: messageText,
      images: images || [],
      conversationId
    });
    
    const targetUser = getUser(receiverId);

    if (!messages[receiverId]) {
      messages[receiverId] = [];
    }
    messages[receiverId].push(messageData);

    if (targetUser?.socketId) {
      io.to(targetUser.socketId).emit("getMessage", messageData);
    }

    socket.emit("messageSent", { success: true, messageData });
  });

  socket.on("seenMessage", ({ senderId, receiverId, messageId }) => {
    if (!senderId || !receiverId || !messageId) return;

    const targetUser = getUser(senderId);
    
    if (messages[senderId]) {
      const message = messages[senderId].find(
        msg => msg.receiverId === receiverId && msg.id === messageId
      );
      
      if (message) {
        message.seen = true;
        if (targetUser?.socketId) {
          io.to(targetUser.socketId).emit("messageSeen", {
            senderId,
            receiverId,
            messageId
          });
        }
      }
    }
  });

  socket.on("updateLastMessage", ({ lastMessage, conversationId }) => {
    if (!lastMessage || !conversationId) return;
    
    io.emit("getLastMessage", {
      lastMessage,
      conversationId
    });
  });

  socket.on("typing", ({ conversationId, userId, isTyping }) => {
    socket.to(conversationId).emit("userTyping", { userId, isTyping });
  });

  socket.on("joinConversation", (conversationId) => {
    if (conversationId) {
      socket.join(conversationId);
    }
  });

  socket.on("leaveConversation", (conversationId) => {
    if (conversationId) {
      socket.leave(conversationId);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", users);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Socket.IO Server running on http://localhost:${process.env.PORT }`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { server, io };