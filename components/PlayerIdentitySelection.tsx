
"use client";

import type { Player } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

interface PlayerIdentitySelectionProps {
  players: Player[];
  onPlayerSelected: (playerId: string) => void;
}

export function PlayerIdentitySelection({ players, onPlayerSelected }: PlayerIdentitySelectionProps) {
  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center">
          <UserCheck className="mr-2 h-8 w-8 text-primary" /> Who Are You?
        </CardTitle>
        <CardDescription>Select your name to continue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {players.map(player => (
          <Button
            key={player.id}
            onClick={() => onPlayerSelected(player.id)}
            className="w-full text-lg py-6"
            variant="outline"
          >
            {player.name}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
