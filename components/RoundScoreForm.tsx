"use client";

import type { Player } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Edit3 } from 'lucide-react';

interface RoundScoreFormProps {
  players: Player[];
  currentRound: number;
  onSubmitScores: (scores: Record<string, number>)  => void;
  isFinalRound?: boolean;
}

export function RoundScoreForm({ players, currentRound, onSubmitScores, isFinalRound }: RoundScoreFormProps) {
  const [roundScores, setRoundScores] = useState<Record<string, string>>({});

  useEffect(() => {
    // Reset scores when players or round change
    const initialScores: Record<string, string> = {};
    players.forEach(p => { initialScores[p.id] = ''});
    setRoundScores(initialScores);
  }, [players, currentRound]);

  const handleScoreChange = (playerId: string, score: string) => {
    setRoundScores(prev => ({ ...prev, [playerId]: score }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scoresToSubmit: Record<string, number> = {};
    let allValid = true;
    for (const player of players) {
      const scoreStr = roundScores[player.id];
      if (scoreStr === undefined || scoreStr.trim() === '') {
        alert(`Please enter a score for ${player.name}.`);
        allValid = false;
        break;
      }
      const scoreNum = parseInt(scoreStr, 10);
      if (isNaN(scoreNum)) {
        alert(`Invalid score for ${player.name}. Please enter a number.`);
        allValid = false;
        break;
      }
      scoresToSubmit[player.id] = scoreNum;
    }

    if (allValid) {
      onSubmitScores(scoresToSubmit);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Edit3 className="mr-2 h-7 w-7 text-primary" />
          Enter Scores for Round {currentRound}
        </CardTitle>
        {isFinalRound && <CardDescription className="text-accent">This is the final round after STOP was called!</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {players.map(player => (
            <div key={player.id} className="space-y-2">
              <Label htmlFor={`score-${player.id}`} className="text-lg font-medium">{player.name}'s Score</Label>
              <Input
                id={`score-${player.id}`}
                type="number"
                value={roundScores[player.id] || ''}
                onChange={(e) => handleScoreChange(player.id, e.target.value)}
                placeholder="Enter score"
                required
                className="text-base h-12"
              />
            </div>
          ))}
          <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90">
             <CheckCircle className="mr-2 h-5 w-5" />
            {isFinalRound ? 'Submit Final Scores & End Game' : 'Submit Round Scores'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
