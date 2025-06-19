import { useState, FormEvent } from "react";
import styles from "@/styles/PlayerCountModal.module.css";

interface PlayerCountModalProps {
  onSubmit: (count: number) => void;
}

export default function PlayerCountModal({ onSubmit }: PlayerCountModalProps) {
  const [playerCount, setPlayerCount] = useState<number>(2);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(playerCount);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>How many players will play?</h2>
        <form onSubmit={handleSubmit}>
          <select
            value={playerCount}
            onChange={(e) => setPlayerCount(Number(e.target.value))}
            className={styles.select}
          >
            <option value={2}>2 Players</option>
            <option value={3}>3 Players</option>
            <option value={4}>4 Players</option>
          </select>
          <button type="submit" className={styles.button}>
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
}
