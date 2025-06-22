"use client";

import type { Player } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Trophy,
  ListOrdered,
  Crown,
  Sparkles,
  Zap,
  Users,
  Target,
} from "lucide-react";

interface ScoreboardProps {
  players: Player[];
  currentRound: number;
  stopperId: string | null;
}

export function Scoreboard({ players, currentRound, stopperId }: ScoreboardProps) {
  const sortedPlayers = [...players].sort(
    (a, b) => a.totalScore - b.totalScore
  );
  const maxRounds = Math.max(0, ...players.map((p) => p.scoresByRound.length));

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

  const getRankBadge = (index: number) => {
    if (index === 0)
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">🥇 1st</Badge>
      );
    if (index === 1)
      return <Badge className="bg-gray-400 hover:bg-gray-500">🥈 2nd</Badge>;
    if (index === 2)
      return <Badge className="bg-amber-600 hover:bg-amber-700">🥉 3rd</Badge>;
    return <Badge variant="outline">{index + 1}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Current Round</p>
                <p className="text-2xl font-bold text-primary">
                  {currentRound}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Leader</p>
                <p className="text-lg font-bold text-green-600">
                  {sortedPlayers[0]?.name || "None"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Players</p>
                <p className="text-2xl font-bold text-blue-600">
                  {players.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main scoreboard */}
      <Card className="shadow-2xl border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl flex items-center">
              <ListOrdered className="mr-3 h-8 w-8 text-primary" />
              Scoreboard
            </CardTitle>
            {currentRound > 0 && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Round {currentRound}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary/20">
                  <TableHead className="w-[80px] text-center font-bold text-lg">
                    Rank
                  </TableHead>
                  <TableHead className="min-w-[200px] font-bold text-lg">
                    Player
                  </TableHead>
                  {Array.from({ length: maxRounds }, (_, i) => (
                    <TableHead
                      key={`round-header-${i}`}
                      className="text-center font-bold text-lg min-w-[80px]"
                    >
                      R{i + 1}
                    </TableHead>
                  ))}
                  <TableHead className="text-right font-bold text-lg min-w-[100px]">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((player, index) => {
                  const isStopper = player.id === stopperId;

                  return (<TableRow
                    key={player.id}
                    className={`border-primary/10 hover:bg-primary/5 transition-colors duration-200 ${
                      isStopper ? "bg-accent/20 border-accent/30" : ""
                    } ${
                      index === 0 ? "bg-yellow-500/10 border-yellow-500/30" : ""
                    }`}
                  >
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {getRankBadge(index)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getPlayerInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            {getPlayerIcon(index)}
                            <span className="font-semibold text-lg text-primary">
                              {player.name}
                            </span>
                            {isStopper && (
                              <Badge variant="destructive" className="text-xs">
                                STOP
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Player{" "}
                            {players.findIndex((p) => p.id === player.id) + 1}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    {Array.from({ length: maxRounds }, (_, i) => (
                      <TableCell
                        key={`score-${player.id}-${i}`}
                        className="text-center"
                      >
                        <div
                          className={`font-semibold text-lg ${
                            player.scoresByRound[i] !== undefined
                              ? player.scoresByRound[i] === 0
                                ? "text-green-600"
                                : "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {player.scoresByRound[i] !== undefined
                            ? player.scoresByRound[i]
                            : "-"}
                        </div>
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div
                        className={`font-bold text-2xl ${
                          index === 0 ? "text-yellow-600" : "text-primary"
                        } animate-pulse`}
                      >
                        {player.totalScore}
                      </div>
                    </TableCell>
                  </TableRow>
                );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
