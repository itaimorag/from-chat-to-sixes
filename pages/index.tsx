import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/layout";
import styles from "@/styles/home.module.css";
import axios from "axios";
import PlayerCountModal from "@/components/PlayerCountModal";

export default function Home() {
  const [roomName, setRoomName] = useState("");
  const router = useRouter();
  const [showPlayerCountModal, setShowPlayerCountModal] = useState(false);

  const handleRoomNameChange = (event: FormEvent<HTMLInputElement>) => {
    setRoomName(event.currentTarget.value.replace(/<\/?[^>]*>/g, ""));
  };

  const handleJoinRoom = async () => {
    if (roomName.trim()) {
      const response = await axios.get(`/api/rooms/${roomName}`);
      const result = response.data;
      console.log("result", result);
      if (result) {
        if (result.players.length >= result.maxUsers) {
          alert("Room is full");
          return;
        }
        router.push(`/${roomName}`);
      } else {
        setShowPlayerCountModal(true);
      }
    }
  };

  const handlePlayerCountSubmit = async (count: number) => {
    const response = await axios.post(`/api/rooms/create`, {
      roomid: roomName,
      maxUsers: count,
    });
    router.push(`/${roomName}`);
  };

  return (
    <Layout>
      <div className={styles.homeContainer}>
        {showPlayerCountModal && (
          <PlayerCountModal onSubmit={handlePlayerCountSubmit} />
        )}
        <h1 style={{ textAlign: "center" }}>Sixes</h1>
        <input
          type="text"
          placeholder="Enter room name"
          value={roomName}
          onChange={handleRoomNameChange}
          className={styles.textInputField}
          onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
        />
        <div className={styles.enterRoomButton} onClick={handleJoinRoom}>
          Join room
        </div>
      </div>
    </Layout>
  );
}
