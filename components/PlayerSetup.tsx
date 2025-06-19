"use client";

import type { Player } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Play, Sparkles, Crown, Zap } from "lucide-react";

interface PlayerSetupProps {
  onSetupComplete: (players: Player[]) => void;
}

const MAX_PLAYERS = 4;
const MIN_PLAYERS = 3;

export function PlayerSetup({ onSetupComplete }: PlayerSetupProps) {
  const [numPlayers, setNumPlayers] = useState<number>(MIN_PLAYERS);
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array(MIN_PLAYERS).fill("")
  );

  const handleNumPlayersChange = (value: string) => {
    const count = parseInt(value, 10);
    setNumPlayers(count);
    setPlayerNames(
      Array(count)
        .fill("")
        .map((_, i) => playerNames[i] || "")
    );
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerNames.some((name) => name.trim() === "")) {
      alert("Please enter names for all players.");
      return;
    }
    const newPlayers: Player[] = playerNames.map((name, index) => ({
      id: `player-${index + 1}-${Date.now()}`,
      name: name.trim(),
      scoresByRound: [],
      totalScore: 0,
      isStopper: false,
      hand: [],
    }));
    onSetupComplete(newPlayers);
  };

  const getPlayerIcon = (index: number) => {
    const icons = [Crown, Sparkles, Zap, Users];
    const IconComponent = icons[index] || Users;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Hero section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Game Setup</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">
          Ready to Play Sixes?
        </h2>
        <p className="text-muted-foreground text-lg">
          Set up your players and get ready for an exciting game!
        </p>
      </div>

      <Card className="w-full shadow-2xl border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-2">
            <Users className="mr-2 h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Player Setup</CardTitle>
          </div>
          <CardDescription className="text-base">
            Enter player names to start your Sixes adventure
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Player count selection */}
            <div className="space-y-3">
              <Label
                htmlFor="numPlayers"
                className="text-base font-semibold flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Number of Players
              </Label>
              <Select
                onValueChange={handleNumPlayersChange}
                defaultValue={String(MIN_PLAYERS)}
              >
                <SelectTrigger
                  id="numPlayers"
                  className="w-full h-12 text-base"
                >
                  <SelectValue placeholder="Select number of players" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: MAX_PLAYERS - MIN_PLAYERS + 1 },
                    (_, i) => MIN_PLAYERS + i
                  ).map((num) => (
                    <SelectItem
                      key={num}
                      value={String(num)}
                      className="text-base"
                    >
                      {num} Players
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {numPlayers} players selected
                </Badge>
              </div>
            </div>

            {/* Player names */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Player Names</Label>
              <div className="grid gap-4">
                {playerNames.map((name, index) => (
                  <div key={index} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <Label
                        htmlFor={`player-${index}`}
                        className="text-sm font-medium flex items-center gap-2 mb-2"
                      >
                        {getPlayerIcon(index)}
                        Player {index + 1}
                      </Label>
                      <Input
                        id={`player-${index}`}
                        type="text"
                        value={name}
                        onChange={(e) =>
                          handleNameChange(index, e.target.value)
                        }
                        placeholder={`Enter Player ${index + 1}'s Name`}
                        required
                        className="text-base h-12 border-2 focus:border-primary transition-colors duration-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full text-lg py-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 transform hover:scale-105 shadow-lg"
                disabled={playerNames.some((name) => name.trim() === "")}
              >
                <Play className="mr-3 h-6 w-6" />
                Start Game
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Game rules preview */}
      <Card className="mt-6 bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="text-center">
            <h3 className="font-semibold mb-2">How to Play Sixes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Each player gets 6 cards</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Lowest score wins</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Call "STOP" to end the game</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
