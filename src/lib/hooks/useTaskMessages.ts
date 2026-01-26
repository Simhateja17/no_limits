import { useState, useEffect, useCallback, useRef } from 'react';
import { dataApi, TaskMessage } from '@/lib/data-api';
import {
  getSocket,
  joinTaskRoom,
  leaveTaskRoom,
  onTaskMessage,
  onTaskTyping,
  sendTaskTypingIndicator,
  removeListener,
} from '@/lib/socket';

interface UseTaskMessagesResult {
  messages: TaskMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  refetch: () => Promise<void>;
  isTyping: boolean;
  typingUser: { name: string } | null;
  setTyping: (isTyping: boolean) => void;
}

export function useTaskMessages(taskId: string | null): UseTaskMessagesResult {
  const [messages, setMessages] = useState<TaskMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<{ name: string } | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!taskId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedMessages = await dataApi.getTaskMessages(taskId);
      setMessages(fetchedMessages);
    } catch (err: any) {
      console.error('Error fetching task messages:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!taskId || !content.trim()) return;

    try {
      const newMessage = await dataApi.sendTaskMessage(taskId, content);
      // The message will be added via socket event, but also add it immediately for responsive UX
      setMessages((prev) => {
        // Check if message already exists (from socket)
        if (prev.some((m) => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    } catch (err: any) {
      console.error('Error sending task message:', err);
      throw err;
    }
  }, [taskId]);

  const handleSetTyping = useCallback((typing: boolean) => {
    if (taskId) {
      sendTaskTypingIndicator(taskId, typing);
    }
  }, [taskId]);

  // Set up socket listeners
  useEffect(() => {
    if (!taskId) return;

    const socket = getSocket();
    if (!socket) return;

    // Join the task room
    joinTaskRoom(taskId);

    // Handle new messages
    const handleNewMessage = (message: TaskMessage) => {
      setMessages((prev) => {
        // Check if message already exists
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    };

    // Handle typing indicator
    const handleTyping = (data: { userId: string; taskId: string; isTyping: boolean; userName: string }) => {
      if (data.taskId === taskId) {
        if (data.isTyping) {
          setIsTyping(true);
          setTypingUser({ name: data.userName });

          // Clear typing indicator after 3 seconds
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingUser(null);
          }, 3000);
        } else {
          setIsTyping(false);
          setTypingUser(null);
        }
      }
    };

    onTaskMessage(handleNewMessage);
    onTaskTyping(handleTyping);

    // Cleanup on unmount or taskId change
    return () => {
      leaveTaskRoom(taskId);
      removeListener('task:newMessage', handleNewMessage);
      removeListener('task:typing', handleTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [taskId]);

  // Fetch messages when taskId changes
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
    isTyping,
    typingUser,
    setTyping: handleSetTyping,
  };
}
