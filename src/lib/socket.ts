import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Initialize socket connection
export const initializeSocket = (token: string): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

// Get existing socket instance
export const getSocket = (): Socket | null => {
  return socket;
};

// Disconnect socket
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Join a chat room
export const joinChatRoom = (roomId: string): void => {
  if (socket?.connected) {
    socket.emit('chat:join', roomId);
  }
};

// Leave a chat room
export const leaveChatRoom = (roomId: string): void => {
  if (socket?.connected) {
    socket.emit('chat:leave', roomId);
  }
};

// Send typing indicator
export const sendTypingIndicator = (roomId: string, isTyping: boolean): void => {
  if (socket?.connected) {
    socket.emit('chat:typing', { roomId, isTyping });
  }
};

// Send message read status
export const sendMessageRead = (roomId: string, messageId: string): void => {
  if (socket?.connected) {
    socket.emit('chat:read', { roomId, messageId });
  }
};

// Listen for new messages
export const onNewMessage = (callback: (message: any) => void): void => {
  if (socket) {
    socket.on('chat:newMessage', callback);
  }
};

// Listen for typing indicator
export const onTyping = (callback: (data: { userId: string; roomId: string; isTyping: boolean; userName: string }) => void): void => {
  if (socket) {
    socket.on('chat:typing', callback);
  }
};

// Listen for user online status
export const onUserOnline = (callback: (data: { userId: string }) => void): void => {
  if (socket) {
    socket.on('user:online', callback);
  }
};

// Listen for user offline status
export const onUserOffline = (callback: (data: { userId: string }) => void): void => {
  if (socket) {
    socket.on('user:offline', callback);
  }
};

// Remove event listener
export const removeListener = (event: string, callback?: (...args: any[]) => void): void => {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
};

// Check if socket is connected
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

// ========== TASK CHAT FUNCTIONS ==========

// Join a task chat room
export const joinTaskRoom = (taskId: string): void => {
  if (socket?.connected) {
    socket.emit('task:join', taskId);
  }
};

// Leave a task chat room
export const leaveTaskRoom = (taskId: string): void => {
  if (socket?.connected) {
    socket.emit('task:leave', taskId);
  }
};

// Send typing indicator for task chat
export const sendTaskTypingIndicator = (taskId: string, isTyping: boolean): void => {
  if (socket?.connected) {
    socket.emit('task:typing', { taskId, isTyping });
  }
};

// Listen for new task messages
export const onTaskMessage = (callback: (message: any) => void): void => {
  if (socket) {
    socket.on('task:newMessage', callback);
  }
};

// Listen for task typing indicator
export const onTaskTyping = (callback: (data: { userId: string; taskId: string; isTyping: boolean; userName: string }) => void): void => {
  if (socket) {
    socket.on('task:typing', callback);
  }
};

// Listen for user joining task room
export const onTaskUserJoined = (callback: (data: { userId: string; taskId: string }) => void): void => {
  if (socket) {
    socket.on('task:userJoined', callback);
  }
};

// Listen for user leaving task room
export const onTaskUserLeft = (callback: (data: { userId: string; taskId: string }) => void): void => {
  if (socket) {
    socket.on('task:userLeft', callback);
  }
};
