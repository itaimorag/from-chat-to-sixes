import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { UserData, TypingInfo, Message } from "./types";
import type { Player, Room } from "@/lib/types";
import { io, Socket } from "socket.io-client";

import {
  ROOM_UPDATE_EVENT,
  NEW_CHAT_MESSAGE_EVENT,
  START_TYPING_MESSAGE_EVENT,
  STOP_TYPING_MESSAGE_EVENT,
  PEEK_DONE_EVENT,
  NEW_GAME_EVENT,
  REPLACE_CARD_EVENT,
  DISCARD_CARD_EVENT,
  CALL_STOP_EVENT,
} from "./eventconst";

export default function useGame(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [room, setRoom] = useState<Room>();
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const [user, setUser] = useState<UserData>();
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const socketRef = useRef<any>();

  useEffect(() => {
    const fetchRoom = async () => {
      const response = await axios.get(`/api/rooms/${roomId}`);

      const result = response.data;

      if (result) {
        setRoom(result);
      }
    };

    fetchRoom();
  }, [roomId]);

  // useEffect(() => {
  //   const fetchMessages = async () => {
  //     const response = await axios.get(`/api/rooms/${roomId}/messages`);
  //     const result = response.data.messages;
  //     setMessages(result);
  //   };

  //   fetchMessages();
  // }, [roomId]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (window?.location?.origin) {
      const socket: Socket = io(window.location.origin, {
        query: { roomId, name: user.name, picture: user.picture },
        // auth: { token: localStorage.getItem("jwt_token") } TODO: add token
      });
      socketRef.current = socket;
  
      socketRef.current.on("connect", () => {
        const id = socketRef.current.id;
  
        setCurrentPlayerId(id);
      });
  
      socketRef.current.on(ROOM_UPDATE_EVENT, (room: Room) => {
        console.log("ROOM_UPDATE_EVENT", room);
        setRoom(room);
      });
  
      return () => {
        socketRef.current.disconnect();
      };
    }
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

  const sendReplaceCard = (row: 'top' | 'bottom', idx: number, pile: 'deck' | 'discard') => {
    if (!socketRef.current) return;
    socketRef.current.emit(REPLACE_CARD_EVENT, row, idx, pile);
  };

  const sendDiscardCard = () => {
    if (!socketRef.current) return;
    socketRef.current.emit(DISCARD_CARD_EVENT);
  };

  const sendCallStop = () => {
    if (!socketRef.current) return;
    socketRef.current.emit(CALL_STOP_EVENT);
  };

  const sendPeekDone = () => {
    if (!socketRef.current) return;
    socketRef.current.emit(PEEK_DONE_EVENT);
  };

  const sendNewGame = () => {
    if (!socketRef.current) return;
    socketRef.current.emit(NEW_GAME_EVENT);
  };

  return {
    messages,
    user,
    currentPlayerId,
    room,
    typingUsers,
    sendMessage,
    startTypingMessage,
    stopTypingMessage,
    setUser,
    setRoom,
    sendReplaceCard,
    sendDiscardCard,
    sendCallStop,
    sendNewGame,
    sendPeekDone,
  };
}
