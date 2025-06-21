/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef, FormEvent } from "react";
import { useRouter } from "next/router";
import useChat from "@/lib/usechat";
import useGame from "@/lib/usegame";
import useTyping from "@/lib/usetyping";
import UserAvatar from "@/components/useravatar";
import Layout from "@/components/layout";
import styles from "@/styles/chatroom.module.css";
import NameModal from "@/components/NameModal";
import type { Player, GameState as GameStateType, Card } from "@/lib/types";
import { GameBoard } from "@/components/GameBoard";
import { SixesIcon } from "@/components/icons/SixesIcon";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Gamepad2, Trophy, Settings } from "lucide-react";
import axios from "axios";

const LOCAL_STORAGE_CURRENT_PLAYER_ID = "sixes_currentPlayerId";

export default function ChatRoom() {
  const router = useRouter();
  const { roomid } = router.query;
  const { user, room, currentPlayerId, setUser, sendNewGame, sendPeekDone, sendReplaceCard, sendDiscardCard, sendCallStop } = useGame(roomid as string);
  const [showNameModal, setShowNameModal] = useState(true);

  useEffect(() => {
    if (!roomid) return;
    const checkRoom = async () => {
      try {
        const response = await axios.get(`/api/rooms/${roomid}`);
        const result = response.data;
        console.log("result", result);
        if (!result) {
          router.replace("/");
          alert("Room does not exist");
        }
        if (result.players.length >= result.maxUsers) {
          router.replace("/");
          alert("Room is full");
        }
      } catch (err) {
        // Optionally handle error (e.g., room doesn't exist)
        router.replace("/");
      }
    };
    checkRoom();
  }, [roomid]);

  const handleNameSubmit = (name: string) => {
    setUser({
      name,
      picture:
        "data:image/png;base64,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",
    });
    setShowNameModal(false);
  };

  const handleNewGame = () => {
    sendNewGame();
  };

  const getGameStateBadge = () => {
    if (!room) return null;
    switch (room.gameState) {
      case "waiting_for_players":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Gamepad2 className="h-3 w-3" /> Waiting for Players
          </Badge>
        );
      case "playing":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Gamepad2 className="h-3 w-3" /> Playing
          </Badge>
        );
      case "final_round":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            Final Round
          </Badge>
        );
      case "game_over":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Trophy className="h-3 w-3" /> Game Over
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className={styles.chatRoomContainer}>
        {showNameModal && <NameModal onSubmit={handleNameSubmit} />}
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/2 overflow-y-auto">
          <div className="page-header flex items-center justify-between bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white px-6 py-4 rounded-xl shadow-md mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold tracking-wide">Room: {roomid}</h1>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <UserAvatar user={user} />
                <h2 className="text-lg font-medium">{user.name}</h2>
              </div>
            )}
          </div>
          <main className="page-main container mx-auto p-4 md:p-8 flex flex-col items-center">
            {/* Header with enhanced styling */}
            <header className="mb-8 text-center w-full">
              <div className="flex items-center justify-center mb-4">
                {getGameStateBadge()}
              </div>
              <div className="relative">
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent flex items-center justify-center mb-4">
                  <SixesIcon className="h-16 w-16 md:h-20 md:w-20 mr-4 fill-current text-primary animate-pulse" />
                  Sixes
                </h1>
                <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4">
                  <div className="w-4 h-4 md:w-6 md:h-6 bg-primary rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
              <p className="text-muted-foreground text-lg md:text-xl mt-2 font-body max-w-2xl mx-auto">
                Track your Shishiyot game scores with ease! The ultimate card
                game companion.
              </p>

              {/* Game info display */}
              {room && room.players.length > 0 && (
                <UICard className="mt-6 max-w-md mx-auto bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Players:</span>
                      <span className="font-semibold text-primary">
                        {room.players.length}
                      </span>
                    </div>
                    {currentPlayerId && (
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-muted-foreground">You are:</span>
                        <span className="font-semibold text-primary">
                          {room.players.find((p) => p.id === currentPlayerId)?.name}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </UICard>
              )}
            </header>

            {/* Main content with enhanced animations */}
            <main className="w-full max-w-4xl">
              <div className="transition-all duration-500 ease-in-out">
                {room && room.gameState && room.players.length > 0 && currentPlayerId && (
                  <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <GameBoard
                      playerId={currentPlayerId}
                      room={room}
                      onPeekDone={sendPeekDone}
                      onReplaceCard={sendReplaceCard}
                      onDiscardCard={sendDiscardCard}
                      onCallStop={sendCallStop}
                      onNewGame={handleNewGame}
                    />
                  </div>
                )}
              </div>
            </main>

            {/* Enhanced footer */}
            <footer className="mt-12 text-center text-muted-foreground text-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
              <p>
                &copy; {new Date().getFullYear()} Sixes Scorecard. Enjoy the
                game!
              </p>
            </footer>
          </main>
        </div>
      </div>
    </Layout>
  );
}
