import { useState, FormEvent } from "react";
import styles from "@/styles/NameModal.module.css";

interface NameModalProps {
  onSubmit: (name: string) => void;
}

export default function NameModal({ onSubmit }: NameModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Enter Your Name</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={styles.input}
            autoFocus
          />
          <button type="submit" className={styles.button}>
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
}
