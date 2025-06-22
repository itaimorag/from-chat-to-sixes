import type { Player } from './types';

// Calculate total score, applying the 50-point rule
export function calculateNewTotalScore(currentTotal: number, roundScore: number): number {
  let newScore = currentTotal + roundScore;
  if (newScore === 50) {
    return 0;
  }
  return newScore;
}

// Apply bonuses and penalties after STOP has been called and final round played
export function applyStopBonusesAndPenalties(
  players: Player[],
  stopperId: string | null
): Player[] {
  if (!stopperId) return players;

  const stopperIndex = players.findIndex(p => p.id === stopperId);
  if (stopperIndex === -1) return players;

  const updatedPlayers = players.map(p => ({ ...p })); // Create a mutable copy

  const stopper = updatedPlayers[stopperIndex];
  let lowestScore = Infinity;
  let hasLowerScoreThanStopper = false;

  updatedPlayers.forEach(player => {
    if (player.totalScore < lowestScore) {
      lowestScore = player.totalScore;
    }
    if (player.id !== stopperId && player.totalScore < stopper.totalScore) {
      hasLowerScoreThanStopper = true;
    }
  });
  
  // Bonus for stopping with 0 points and having the lowest score
  if (stopper.totalScore === 0 && stopper.totalScore === lowestScore) {
    stopper.totalScore -= 10;
  } 
  // Penalty for stopping and someone else having a lower score
  else if (hasLowerScoreThanStopper) {
    stopper.totalScore += 10;
  }
  // If stopper called STOP, has lowest score (but not 0), no penalty or bonus other than winning.
  // The rule "STOP but another player has fewer points → +10 penalty" covers this.
  // The rule "STOP with 0 points → –10 points" seems to imply this is the *only* way to get -10.

  return updatedPlayers;
}

export function getPlayerById(players: Player[], id: string): Player | undefined {
  return players.find(p => p.id === id);
}
