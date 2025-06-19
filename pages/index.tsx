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

  //   useEffect(() => {
  //     const fetchUsers = async () => {
  //       const response = await axios.get(
  //         `/api/rooms/${roomId}/users`
  //       );
  //       const result = response.data.users;
  //       setUsers(result);
  //     };

  //     fetchUsers();
  // }, [roomId]);

  const handleJoinRoom = async () => {
    if (roomName.trim()) {
      const response = await axios.get(`/api/rooms/${roomName}/rooms`);
      const result = response.data;
      console.log("result", result);

      if (result.isRoomExist) {
        if (result.isRoomMax) {
          alert("Room is full");
          return;
        }
        //todo we would like to first show a modal to ask the user name

        router.push(`/${roomName}`);
      } else {
        setShowPlayerCountModal(true);
      }
    }
  };

  const handlePlayerCountSubmit = async (count: number) => {
    const response = await axios.post(`/api/rooms/${roomName}/create`, {
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
        <h1 style={{ textAlign: "center" }}>
          Chat Applications with Socket.IO
        </h1>
        <input
          type="text"
          placeholder="Room"
          value={roomName}
          onChange={handleRoomNameChange}
          className={styles.textInputField}
          onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
        />
        <div className={styles.enterRoomButton} onClick={handleJoinRoom}>
          Join room
        </div>
        There are many ways to achieve real-time content updates on the web.
        Long-polling, web sockets and server-side events are popular ways for
        real-time updates. With long-polling an HTTP request is made to the
        server at a predefined interval. In server-side events, the browser's
        event source API is used to open a channel of communication between the
        client and the server for updates to flow from the server to the client.
        The web socket protocol opens a two-way communication channel between
        the client and the server to allow updates to move in both ways.
        <p>
          This real-time chat application is built with{" "}
          <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
            <strong>Next.js</strong>
          </a>{" "}
          using{" "}
          <a href="https://socket.io/" target="_blank" rel="noreferrer">
            <strong>Socket.IO</strong>
          </a>{" "}
          for demonstrations.
        </p>
      </div>
    </Layout>
  );
}
