"use client";

import type { Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCheck, Users, Crown, Sparkles, Zap } from "lucide-react";

interface PlayerIdentitySelectionProps {
  players: Player[];
  onPlayerSelected: (playerId: string) => void;
}

export function PlayerIdentitySelection({
  players,
  onPlayerSelected,
}: PlayerIdentitySelectionProps) {
  const getPlayerIcon = (index: number) => {
    const icons = [Crown, Sparkles, Zap, Users];
    const IconComponent = icons[index] || Users;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPlayerInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Hero section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <UserCheck className="h-4 w-4" />
          <span className="text-sm font-medium">Player Selection</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Who Are You?</h2>
        <p className="text-muted-foreground text-lg">
          Select your name to continue the game
        </p>
      </div>

      <Card className="w-full shadow-2xl border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-2">
            <UserCheck className="mr-2 h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Choose Your Identity</CardTitle>
          </div>
          <CardDescription className="text-base">
            Select your name from the list below to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {players.map((player, index) => (
              <div key={player.id} className="group">
                <Button
                  onClick={() => onPlayerSelected(player.id)}
                  className="w-full text-lg py-6 h-auto bg-gradient-to-r from-card to-card/80 hover:from-primary/10 hover:to-primary/20 border-2 border-transparent hover:border-primary/30 transition-all duration-300 transform hover:scale-105 shadow-lg group-hover:shadow-xl"
                  variant="outline"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/50 transition-colors duration-300">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                          {getPlayerInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          {getPlayerIcon(index)}
                          <span className="font-semibold text-lg">
                            {player.name}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Player {index + 1}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Select
                      </Badge>
                      <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game info */}
      <Card className="mt-6 bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="text-center">
            <h3 className="font-semibold mb-2">Game Ready!</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                <span>{players.length} players ready</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Game will start after selection</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
