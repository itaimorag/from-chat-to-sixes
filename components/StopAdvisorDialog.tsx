"use client";

import type { Player, StopAdvisorDialogFormState } from "@/lib/types";
import type {
  StopAdviceOutput,
  StopAdviceInput,
} from "@/ai/flows/stop-advisor";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Brain, Lightbulb, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StopAdvisorDialogProps {
  currentPlayer: Player;
  otherPlayers: Player[];
  cardsRemainingInDeck: number;
  cardsInDiscardPile: number;
  triggerButton?: React.ReactNode;
}

export function StopAdvisorDialog({
  currentPlayer,
  otherPlayers,
  cardsRemainingInDeck,
  cardsInDiscardPile,
  triggerButton,
}: StopAdvisorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<StopAdviceOutput | null>(null);
  const [dialogFormState, setDialogFormState] =
    useState<StopAdvisorDialogFormState>({
      myEstimatedScore: currentPlayer.totalScore,
    });
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setDialogFormState({ myEstimatedScore: currentPlayer.totalScore });
    }
  }, [currentPlayer.totalScore, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDialogFormState((prev) => ({
      ...prev,
      [name]: parseInt(value, 10) || 0,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setAdvice(null);
    try {
      const fullStopAdviceInput: StopAdviceInput = {
        myEstimatedScore:
          dialogFormState.myEstimatedScore ?? currentPlayer.totalScore,
        opponentScores: otherPlayers.map((p) => p.totalScore),
        cardsRemainingInDeck,
        cardsInDiscardPile,
      };

      const response = await fetch("/api/stop-advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullStopAdviceInput),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI advice");
      }

      const result = await response.json();
      setAdvice(result);
    } catch (error) {
      console.error("Error getting AI advice:", error);
      toast({
        title: "Error",
        description: "Failed to get AI advice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Brain className="mr-2 h-4 w-4" /> Get AI Advice
    </Button>
  );

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setAdvice(null);
      setDialogFormState({ myEstimatedScore: currentPlayer.totalScore });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{triggerButton || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center font-headline">
            <Lightbulb className="mr-2 h-6 w-6 text-primary" /> AI Stop Advisor
          </DialogTitle>
          <DialogDescription className="font-body">
            Get advice on whether to call "STOP". Your current total score is{" "}
            {currentPlayer.totalScore}. Deck: {cardsRemainingInDeck}, Discard:{" "}
            {cardsInDiscardPile}.
          </DialogDescription>
        </DialogHeader>

        {!advice && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="myEstimatedScore">
                Your Estimated Score (if you stop now)
              </Label>
              <Input
                id="myEstimatedScore"
                name="myEstimatedScore"
                type="number"
                value={dialogFormState.myEstimatedScore}
                onChange={handleInputChange}
                className="text-base"
              />
            </div>
          </div>
        )}

        {advice && (
          <Card className="my-4 bg-background shadow-inner">
            <CardHeader>
              <CardTitle
                className={`text-xl flex items-center ${
                  advice.shouldStop ? "text-green-600" : "text-red-600"
                }`}
              >
                {advice.shouldStop ? (
                  <ThumbsUp className="mr-2 h-5 w-5" />
                ) : (
                  <ThumbsDown className="mr-2 h-5 w-5" />
                )}
                Recommendation:{" "}
                {advice.shouldStop ? "Call STOP" : "DO NOT Call STOP"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">Reasoning:</p>
              <p className="text-sm text-muted-foreground">
                {advice.reasoning}
              </p>
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          {!advice && (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Analyzing..." : "Get Advice"}
            </Button>
          )}
          {advice && (
            <Button onClick={() => setAdvice(null)} variant="outline">
              Ask Again
            </Button>
          )}
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
