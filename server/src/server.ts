import express, { Response, Request } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import mongoose from 'mongoose';
import path from "path";
import { Server } from "socket.io";

// Import your custom config and types
import './config/passport';    
import { SocketEvent, SocketId } from "./types/socket";
import { USER_CONNECTION_STATUS, User } from "./types/user";

// Import Routes
import gitRoutes from './routes/gitRoutes';
import authRoutes from './routes/authRoutes'; 

dotenv.config(); // Load .env first

// 1. Validate Env Vars early
const MONGODB_URI = process.env.DATABASE_URL;
if (!MONGODB_URI) {
    console.error('FATAL ERROR: DATABASE_URL is not defined.');
    process.exit(1);
}

const app = express();
app.use(express.json());

const allowedOrigins = [
     'http://localhost:5173',
     'https://synctogether.netlify.app',
     'http://k8s-threetie-frontend-267d7807cc-e770833b324085ff.elb.us-east-1.amazonaws.com'

];

// 2. Configure CORS
app.use(cors({
    origin: function(origin, callback){
        if (allowedOrigins.indexOf(origin as any) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
        }
    },
    credentials: true
}));

// --- CRITICAL FIX: HEALTH CHECK ROUTE ---
// This MUST be placed before static files and other routes.
// Kubernetes hits this endpoint to check if the pod is alive.
app.get("/health", (req: Request, res: Response) => {
    res.status(200).send("OK");
});
// ----------------------------------------

app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// Mount API Routes
app.use('/api/git', gitRoutes);
app.use('/api/auth', authRoutes);


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
});


// --- Socket Logic ---

let userSocketMap: User[] = [];

function getUsersInRoom(roomId: string): User[] {
    return userSocketMap.filter((user) => user.roomId == roomId);
}

function getRoomId(socketId: SocketId): string | null {
    const roomId = userSocketMap.find((user) => user.socketId === socketId)?.roomId;
    if (!roomId) {
        console.error("Room ID is undefined for socket ID:", socketId);
        return null;
    }
    return roomId;
}

function getUserBySocketId(socketId: SocketId): User | null {
    const user = userSocketMap.find((user) => user.socketId === socketId);
    if (!user) {
        console.error("User not found for socket ID:", socketId);
        return null;
    }
    return user;
}

io.on("connection", (socket) => {
    // Handle user actions
    socket.on(SocketEvent.JOIN_REQUEST, ({ roomId, username }) => {
        const isUsernameExist = getUsersInRoom(roomId).filter((u) => u.username === username);
        if (isUsernameExist.length > 0) {
            io.to(socket.id).emit(SocketEvent.USERNAME_EXISTS);
            return;
        }

        const user = {
            username,
            roomId,
            status: USER_CONNECTION_STATUS.ONLINE,
            cursorPosition: 0,
            typing: false,
            socketId: socket.id,
            currentFile: null,
        };
        userSocketMap.push(user);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user });
        const users = getUsersInRoom(roomId);
        io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user, users });
    });

    socket.on("disconnecting", () => {
        const user = getUserBySocketId(socket.id);
        if (!user) return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(SocketEvent.USER_DISCONNECTED, { user });
        userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
        socket.leave(roomId);
    });

    // Handle file actions
    socket.on(SocketEvent.SYNC_FILE_STRUCTURE, ({ fileStructure, openFiles, activeFile, socketId }) => {
        io.to(socketId).emit(SocketEvent.SYNC_FILE_STRUCTURE, { fileStructure, openFiles, activeFile });
    });

    socket.on(SocketEvent.DIRECTORY_CREATED, ({ parentDirId, newDirectory }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId) return;
        socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_CREATED, { parentDirId, newDirectory });
    });

    socket.on(SocketEvent.DIRECTORY_UPDATED, ({ dirId, children }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId) return;
        socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_UPDATED, { dirId, children });
    });

    socket.on(SocketEvent.DIRECTORY_RENAMED, ({ dirId, newName }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId) return;
        socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_RENAMED, { dirId, newName });
    });

    socket.on(SocketEvent.DIRECTORY_DELETED, ({ dirId }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId) return;
        socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_DELETED, { dirId });
    });

    socket.on(SocketEvent.FILE_CREATED, ({ parentDirId, newFile }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId) return;
        socket.broadcast.to(roomId).emit(SocketEvent.FILE_CREATED, { parentDirId, newFile });
    });

    socket.on(SocketEvent.FILE_UPDATED, ({ fileId, newContent }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId) return;
        socket.broadcast.to(roomId).emit(SocketEvent.FILE_UPDATED, { fileId, newContent });
    });

    socket.on(SocketEvent.FILE_RENAMED, ({ fileId, newName }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId) return;
        socket.broadcast.to(roomId).emit(SocketEvent.FILE_RENAMED, { fileId, newName });
    });

    socket.on(SocketEvent.FILE_DELETED, ({ fileId }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId) return;
        socket.broadcast.to(roomId).emit(SocketEvent.FILE_DELETED, { fileId });
    });

    // Handle user status
    socket.on(SocketEvent.USER_OFFLINE, ({ socketId }) => {
        userSocketMap = userSocketMap.map((user) => {
            if (user.socketId === socketId) {
                return { ...user, status: USER_CONNECTION_STATUS.OFFLINE };
            }
            return user;
        });
        const roomId = getRoomId(socketId);
        if (!roomId) return;
        socket.broadcast.to(roomId).emit(SocketEvent.USER_OFFLINE, { socketId });
    });

    socket.on(SocketEvent.USER_ONLINE, ({ socketId }) => {
        userSocketMap = userSocketMap.map((user) => {
            if (user.socketId === socketId) {
                return { ...user, status: USER_CONNECTION_STATUS.ONLINE };
            }
            return user;
        });
        const roomId = getRoomId(socketId);
        if (!roomId) return;
        socket.broadcast.to(roomId).emit(SocketEvent.USER_ONLINE, { socketId });
    });

    // Handle chat actions
    socket.on(SocketEvent.SEND_MESSAGE, ({ message }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId) return;
        socket.broadcast.to(roomId).emit(SocketEvent.RECEIVE_MESSAGE, { message });
    });

    // Handle cursor position and selection
    socket.on(SocketEvent.TYPING_START, ({ cursorPosition, selectionStart, selectionEnd }) => {
        userSocketMap = userSocketMap.map((user) => {
            if (user.socketId === socket.id) {
                return { ...user, typing: true, cursorPosition, selectionStart, selectionEnd };
            }
            return user;
        });
        const user = getUserBySocketId(socket.id);
        if (!user) return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(SocketEvent.TYPING_START, { user });
    });

    socket.on(SocketEvent.TYPING_PAUSE, () => {
        userSocketMap = userSocketMap.map((user) => {
            if (user.socketId === socket.id) {
                return { ...user, typing: false };
            }
            return user;
        });
        const user = getUserBySocketId(socket.id);
        if (!user) return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(SocketEvent.TYPING_PAUSE, { user });
    });

    socket.on(SocketEvent.CURSOR_MOVE, ({ cursorPosition, selectionStart, selectionEnd }) => {
        userSocketMap = userSocketMap.map((user) => {
            if (user.socketId === socket.id) {
                return { ...user, cursorPosition, selectionStart, selectionEnd };
            }
            return user;
        });
        const user = getUserBySocketId(socket.id);
        if (!user) return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(SocketEvent.CURSOR_MOVE, { user });
    });

    socket.on(SocketEvent.REQUEST_DRAWING, () => {
        const roomId = getRoomId(socket.id);
        if (!roomId) return;
        socket.broadcast.to(roomId).emit(SocketEvent.REQUEST_DRAWING, { socketId: socket.id });
    });

    socket.on(SocketEvent.SYNC_DRAWING, ({ drawingData, socketId }) => {
        socket.broadcast.to(socketId).emit(SocketEvent.SYNC_DRAWING, { drawingData });
    });

    socket.on(SocketEvent.DRAWING_UPDATE, ({ snapshot }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId) return;
        socket.broadcast.to(roomId).emit(SocketEvent.DRAWING_UPDATE, { snapshot });
    });

    // WebRTC Listeners
    socket.on("webrtc-offer", ({ to, offer }) => {
        console.log(`Forwarding offer from ${socket.id} to ${to}`);
        socket.to(to).emit("webrtc-offer", { from: socket.id, offer });
    });

    socket.on("webrtc-answer", ({ to, answer }) => {
        console.log(`Forwarding answer from ${socket.id} to ${to}`);
        socket.to(to).emit("webrtc-answer", { from: socket.id, answer });
    });

    socket.on("webrtc-ice-candidate", ({ to, candidate }) => {
        socket.to(to).emit("webrtc-ice-candidate", { from: socket.id, candidate });
    });
});

const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});


// Start Server
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    
    // Connect to DB after server starts (or concurrently)
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('MongoDB connected successfully.'))
        .catch(err => {
            console.error('MongoDB connection error:', err);
            // Don't exit process here if you want the pod to stay alive for debugging, 
            // but for production, crashing is usually correct if DB is critical.
            // process.exit(1); 
        });
});