"use client";

import type { Player } from "@/lib/types";
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CheckCircle,
  Edit3,
  Target,
  AlertTriangle,
  Crown,
  Sparkles,
  Zap,
  Users,
} from "lucide-react";

interface RoundScoreFormProps {
  players: Player[];
  currentRound: number;
  onSubmitScores: (scores: Record<string, number>) => void;
  isFinalRound?: boolean;
}

export function RoundScoreForm({
  players,
  currentRound,
  onSubmitScores,
  isFinalRound,
}: RoundScoreFormProps) {
  const [roundScores, setRoundScores] = useState<Record<string, string>>({});

  useEffect(() => {
    // Reset scores when players or round change
    const initialScores: Record<string, string> = {};
    players.forEach((p) => {
      initialScores[p.id] = "";
    });
    setRoundScores(initialScores);
  }, [players, currentRound]);

  const handleScoreChange = (playerId: string, score: string) => {
    setRoundScores((prev) => ({ ...prev, [playerId]: score }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scoresToSubmit: Record<string, number> = {};
    let allValid = true;
    for (const player of players) {
      const scoreStr = roundScores[player.id];
      if (scoreStr === undefined || scoreStr.trim() === "") {
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

  const isFormComplete = () => {
    return players.every(
      (player) => roundScores[player.id] && roundScores[player.id].trim() !== ""
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with round info */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <Target className="h-4 w-4" />
          <span className="text-sm font-medium">Round {currentRound}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">
          Enter Round Scores
        </h2>
        <p className="text-muted-foreground text-lg">
          {isFinalRound
            ? "Final round scores - game will end after submission!"
            : "Enter scores for this round"}
        </p>
      </div>

      <Card className="shadow-2xl border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl flex items-center">
              <Edit3 className="mr-3 h-8 w-8 text-primary" />
              Round {currentRound} Scores
            </CardTitle>
            {isFinalRound && (
              <Badge
                variant="destructive"
                className="text-lg px-4 py-2 flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Final Round
              </Badge>
            )}
          </div>
          {isFinalRound && (
            <CardDescription className="text-lg text-destructive font-semibold">
              This is the final round after STOP was called! Game will end after
              submission.
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6">
              {players.map((player, index) => (
                <div key={player.id} className="group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-4 border-2 border-transparent group-hover:border-primary/30 rounded-lg transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/50 transition-colors duration-300">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                            {getPlayerInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            {getPlayerIcon(index)}
                            <Label
                              htmlFor={`score-${player.id}`}
                              className="text-xl font-semibold text-primary"
                            >
                              {player.name}
                            </Label>
                            {player.isStopper && (
                              <Badge variant="destructive" className="text-xs">
                                STOP
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Current Total: {player.totalScore}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor={`score-${player.id}`}
                          className="text-base font-medium"
                        >
                          Round {currentRound} Score
                        </Label>
                        <Input
                          id={`score-${player.id}`}
                          type="number"
                          value={roundScores[player.id] || ""}
                          onChange={(e) =>
                            handleScoreChange(player.id, e.target.value)
                          }
                          placeholder="Enter score for this round"
                          required
                          className="text-lg h-14 border-2 focus:border-primary transition-colors duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                className={`w-full text-xl py-8 transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isFinalRound
                    ? "bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive"
                    : "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                }`}
                disabled={!isFormComplete()}
              >
                <CheckCircle className="mr-3 h-6 w-6" />
                {isFinalRound
                  ? "Submit Final Scores & End Game"
                  : "Submit Round Scores"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Form status */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isFormComplete() ? "bg-green-500" : "bg-yellow-500"
                } animate-pulse`}
              ></div>
              <span className="font-semibold">
                {isFormComplete()
                  ? "Ready to submit"
                  : "Complete all scores to continue"}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {
                players.filter(
                  (p) => roundScores[p.id] && roundScores[p.id].trim() !== ""
                ).length
              }{" "}
              of {players.length} scores entered
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
