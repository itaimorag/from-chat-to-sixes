import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { UserData, TypingInfo, Message } from "./types";
import type { Player } from "@/lib/types";

import {
  USER_JOIN_CHAT_EVENT,
  USER_LEAVE_CHAT_EVENT,
  NEW_CHAT_MESSAGE_EVENT,
  START_TYPING_MESSAGE_EVENT,
  STOP_TYPING_MESSAGE_EVENT,
} from "./eventconst";

export default function useGame(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const [user, setUser] = useState<UserData>();
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const socketRef = useRef<any>();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get(`/api/rooms/${roomId}/users`);
      const result = response.data.users;
      setPlayers(result);
    };

    fetchUsers();
  }, [roomId]);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await axios.get(`/api/rooms/${roomId}/messages`);
      const result = response.data.messages;
      setMessages(result);
    };

    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    if (!user) {
      return;
    }
    fetch("/api/socketio").finally(() => {
      socketRef.current = io({
        query: { roomId, name: user.name, picture: user.picture },
      });

      socketRef.current.on("connect", () => {
        console.log(socketRef.current.id);
      });

      socketRef.current.on(USER_JOIN_CHAT_EVENT, (player: Player) => {
        if (player.id === socketRef.current.id) {
          setCurrentPlayerId(player.id);
        }

        setPlayers((players) => [...players, player]);
      });

      socketRef.current.on(USER_LEAVE_CHAT_EVENT, (player: Player) => {
        setPlayers((players) => players.filter((u) => u.id !== player.id));
      });

      socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, (message: Message) => {
        const incomingMessage = {
          ...message,
          ownedByCurrentUser: message.senderId === socketRef.current.id,
        };
        setMessages((messages) => [...messages, incomingMessage]);
      });

      socketRef.current.on(
        START_TYPING_MESSAGE_EVENT,
        (typingInfo: TypingInfo) => {
          if (typingInfo.senderId !== socketRef.current.id) {
            const user = typingInfo.user;
            setTypingUsers((users) => [...users, user]);
          }
        }
      );

      socketRef.current.on(
        STOP_TYPING_MESSAGE_EVENT,
        (typingInfo: TypingInfo) => {
          if (typingInfo.senderId !== socketRef.current.id) {
            const user = typingInfo.user;
            setTypingUsers((users) =>
              users.filter((u) => u.name !== user.name)
            );
          }
        }
      );

      return () => {
        socketRef.current.disconnect();
      };
    });
  }, [roomId, user]);

  const sendMessage = (messageBody: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
      body: messageBody,
      senderId: socketRef.current.id,
      user: user,
    });
  };

  const startTypingMessage = () => {
    if (!socketRef.current) return;
    socketRef.current.emit(START_TYPING_MESSAGE_EVENT, {
      senderId: socketRef.current.id,
      user,
    });
  };

  const stopTypingMessage = () => {
    if (!socketRef.current) return;
    socketRef.current.emit(STOP_TYPING_MESSAGE_EVENT, {
      senderId: socketRef.current.id,
      user,
    });
  };

  return {
    messages,
    user,
    currentPlayerId,
    players,
    typingUsers,
    sendMessage,
    startTypingMessage,
    stopTypingMessage,
    setUser,
    setPlayers,
  };
}
