"use client";

import type { Player } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, ListOrdered } from 'lucide-react';

interface ScoreboardProps {
  players: Player[];
  currentRound: number;
}

export function Scoreboard({ players, currentRound }: ScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => a.totalScore - b.totalScore);
  const maxRounds = Math.max(0, ...players.map(p => p.scoresByRound.length));


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <ListOrdered className="mr-2 h-7 w-7 text-primary" />
          Scoreboard
          {currentRound > 0 && <span className="ml-2 text-lg font-normal text-muted-foreground">(Round: {currentRound})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center font-headline">Rank</TableHead>
                <TableHead className="min-w-[150px] font-headline">Player</TableHead>
                {Array.from({ length: maxRounds }, (_, i) => (
                  <TableHead key={`round-header-${i}`} className="text-center font-headline">R{i + 1}</TableHead>
                ))}
                <TableHead className="text-right font-headline">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlayers.map((player, index) => (
                <TableRow key={player.id} className={player.isStopper ? 'bg-accent/20' : ''}>
                  <TableCell className="text-center font-medium">
                    {index === 0 && currentRound > 0 ? <Trophy className="h-5 w-5 inline text-yellow-500" /> : index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-primary">{player.name}{player.isStopper ? ' (STOP)' : ''}</TableCell>
                  {Array.from({ length: maxRounds }, (_, i) => (
                    <TableCell key={`score-${player.id}-${i}`} className="text-center">
                      {player.scoresByRound[i] !== undefined ? player.scoresByRound[i] : '-'}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold text-xl animate-score-update">
                    {player.totalScore}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
