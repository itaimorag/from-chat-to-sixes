"use client";

import type { Player } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Play } from 'lucide-react';

interface PlayerSetupProps {
  onSetupComplete: (players: Player[], numPlayers: number) => void;
}

const MAX_PLAYERS = 4;
const MIN_PLAYERS = 3;

export function PlayerSetup({ onSetupComplete }: PlayerSetupProps) {
  const [numPlayers, setNumPlayers] = useState<number>(MIN_PLAYERS);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(MIN_PLAYERS).fill(''));

  const handleNumPlayersChange = (value: string) => {
    const count = parseInt(value, 10);
    setNumPlayers(count);
    setPlayerNames(Array(count).fill('').map((_, i) => playerNames[i] || ''));
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerNames.some(name => name.trim() === '')) {
      alert('Please enter names for all players.');
      return;
    }
    const newPlayers: Player[] = playerNames.map((name, index) => ({
      id: `player-${index + 1}-${Date.now()}`,
      name: name.trim(),
      scoresByRound: [],
      totalScore: 0,
      isStopper: false,
    }));
    onSetupComplete(newPlayers, numPlayers);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center"><Users className="mr-2 h-8 w-8 text-primary" /> Player Setup</CardTitle>
        <CardDescription>Enter player names to start the game.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="numPlayers">Number of Players</Label>
            <Select onValueChange={handleNumPlayersChange} defaultValue={String(MIN_PLAYERS)}>
              <SelectTrigger id="numPlayers" className="w-full">
                <SelectValue placeholder="Select number of players" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i).map(num => (
                  <SelectItem key={num} value={String(num)}>{num} Players</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {playerNames.map((name, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`player-${index}`}>Player {index + 1} Name</Label>
              <Input
                id={`player-${index}`}
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={`Enter Player ${index + 1}'s Name`}
                required
                className="text-base"
              />
            </div>
          ))}
          <Button type="submit" className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
            <Play className="mr-2 h-5 w-5" /> Start Game
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
