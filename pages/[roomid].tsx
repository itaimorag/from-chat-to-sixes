/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef, FormEvent } from "react";
import { useRouter } from "next/router";
import useChat from "@/lib/usechat";
import ChatMessage from "@/components/chatmessage";
import useTyping from "@/lib/usetyping";
import NewMessageForm from "@/components/newmessageform";
import TypingMessage from "@/components/typingmessage";
import Users from "@/components/users";
import UserAvatar from "@/components/useravatar";
import Layout from "@/components/layout";
import styles from "@/styles/chatroom.module.css";
import NameModal from "@/components/NameModal";

export default function ChatRoom() {
  const router = useRouter();
  const { roomid } = router.query;
  const {
    messages,
    user,
    users,
    typingUsers,
    sendMessage,
    startTypingMessage,
    stopTypingMessage,
    setUser,
  } = useChat(roomid as string);
  const [newMessage, setNewMessage] = useState("");
  const [timeDiff, setTimeDiff] = useState(0);
  const scrollTarget = useRef(null);
  const { isTyping, startTyping, stopTyping, cancelTyping } = useTyping();
  const [showNameModal, setShowNameModal] = useState(true);

  useEffect(() => {
    const response = fetch("/api/currenttime")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setTimeDiff(Date.now() - data.current);
      })
      .catch((error) => {
        //---
      });
  }, []);

  const handleNewMessageChange = (event: FormEvent<HTMLInputElement>) => {
    setNewMessage(event.currentTarget.value.replace(/<\/?[^>]*>/g, ""));
  };

  const handleSendMessage = (event: FormEvent<HTMLInputElement>) => {
    event.preventDefault();
    cancelTyping();
    sendMessage(newMessage);
    setNewMessage("");
  };

  const handleNameSubmit = (name: string) => {
    console.log("name", name);
    setUser({
      name,
      picture:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADACAMAAAB/Pny7AAABAlBMVEUzcYD///8dHR70s4IUFBRKSlTio3mGtNHU1tjz+v8AAAA0dIMwb3/WkGEpbHzNhlb7uIYTDw4ZGRlCQksUZHXS3eDz9veNqrI+d4VciZUtLTHo7vDA0NQpTlfqqHgcGBg5OUAPAAAvZXJmkJvMlm4bEhAjQ0seIyV+oKmrwMZRgo+guL8AW21zmqS9noKbn6YjO0ErWmUACg/YqoQZJyu+jGewgmBlTTtcen2GjIVCMiVMdXzKo4FsgoGckYCtmIHu2s0/WmZcWmLExMhvcnjouJXOxL/P4/C1z9+qq6+fxd1/gYiHmqdbZnV4m7Nkd4pMTk5ui6FTPjAwJSB5WkObcVS8DKTNAAAQl0lEQVR4nMWdaUPaSBjHBwQWk2yWIyAaLqlCkVYBqVat2kq7u67b1lb9/l9lZ3JO7nmeCd3/K+VI5sdzzZFMSEFS5owYOpGWbpCZKdsWIvXtdveVYWjyKEyaYbzqtv83GHN6lIdRfOnG0VTGPHiY1rSTL4qN05m2fjlMa7YBFAdnhsXBwbRmu3mFSlSasYvEwcCYs119I1Zxpeu7qNSGgJnuahtFsXC03ekvgDFfkY2jWDjkFdg4UJiZvrFYCUvTZxuFaXWMX4XCZHRgiQAC055tNu6j0vUZpE8AgGm93Vw6TpJmvAUYRxim3T36pS7myjgS77CJwpizzRT8bOmGcM0RhPk/XMyVuKuJwXR3/xcXc2XsdvODmXbQLqYGhD2K3hHqD4jAzHDdF9Z6bbQYe1qMRgRJpGsiBTQbpr2DKfq00aPefNIoleqeSqVScTVfjDA8mr6TndQyYcy3iHBRyWK+v7/Pmh9SvU5fny8InMd4m5nUsmDMVwiWUW8SB+IT7Q/GIzhNZs8zAwbOopLRuJSKYmm/BMfJpEmHaYGrPo2U1X4WiW2dxngEdDbjKL3gpMKY8B4MjZVMq3g4qwWYJtU2aTDg2FfVXlEUxfK1Rg9Kk5oFUmDMt8DyopJxHcLCchuURk+jSYZpvwazzIEslKYB9TT9dXK9SYbZQbAAURjNCpoF9B04zFQD1n21h2ChNGMgjKYl9tOSYLrQEbLaa+Bg4KbRk/rQCTAtaD9ZXeBYqMawM7E+dEK5iYeBF35tLlQq40xT7EFpkroCsTDt1/BiibULy2g9aLfciE9psTAzMMtohYdh1QZ6PiN2eBMH04KP93tYJ3NpoCnNiAubGBjzCDyw1CYShrFowLUzrpcWAwOt/CwtSxmG0RSh59Rfi8BM4YNkFdS9jNU+tHaSmNoZgUE4GVnIGobZJgdHi8DAnYyomE5ZBGYFNU3U0cIw0w7Cyw7lWUolcP9Zi0ymhWDMVwjD4Lxsufz5FDQN9MR6uCMQgpkhpvtUTE9mqTw9V84DL02gpiHhpbUgTAsR/USFV3+GcrZVO18GTDOHnlkPTXAEYNo7mPlxDYPyrl+LwIAHA8QITnMGYFoEMxEL62MuFeXny8FWbWtrq/YcgCmBpzdoc1tJMG3MTCxshLlUSs9nFQslClMHj2yI8badANNFLcIAqoyiPL0c9B2UGJg52M+I0U2AwUwri8c/9a/zgy1etZcQDDxo6DgtHqb7BsNCVJEeMyW5pOmrFoQ5C34TPu9E9aYbC6PiVi1HmYP/5bJ++VIJkTCYg1DXAdw/o9LUOJgW0jCLRgbJ4PI8YhRblRDMPjidUb1pxcDs4tYt02GWy8vzOKM4prkMBg0KRt+NwiDGyjZML5lEGfx8eRdvFCedKfIw3Ajag0F0/VNhWMj7JSUB5iwHGG4o4MKYiK5/CoxVHA9SjGLDbAVhwPMalrSOGYKZYXoyFsw4msyWweKYQhMImnoJkc1Yn2YWhGkjwz8OhqJkuFeCn9XhgwBL+m47ANPFehmFCaLQUHknwuGowZkG0wNg0jrdAAw2/MMwrMuSEShB0/D5bH+O/EXdFGDDtNBeFoBZ1mEoVBUOBhf/DGa3xcFMkV0ZEoiZ5eUZEIXqxaPBhgzr0kx9mDZ0yY+H8VJz/bkCRqGmGXjfn2vYy56cC2uIpJf5MMpzH47CmwY+0PRhbD+zYLrYImPDLFlGWj4dIOzCus5PSzuhI3MZk0a6LgxuHsM5jN4rPrH8ijXMVp8ltOXyqTGWuP7bntlgMJiZP0d65+bDwQH7cZdnKMOwwrlkZj04+HCDv+DQng9kMC3sIYh+dUxbU6PVYnmJ8zLmZz+XynON5cHjK3zsthyYKdrLtBuLoPaiLM8xqcz6cuWcwVh/3qJZjKkNg1iOdaS/P7UbcaYozxUcC9WzorzYxzl9jzWNtWRLcCsyDsyF05wDtzko07woypnz9wW6KWy1hrAxJvIARLtwCCoKOv6ZXRuKMwdVu0AnNDbeJFIh48MMJGDePSmOj9ZusE2xgoZIhAwhHkzp6Z0MzDIHGBo0RGJc5lumfykDc3D55MLg3YyN0EjBRHciaAJwCX6iy4wF89P9Ew9DVJPC4OPfz2Zb53Iw5+7f6GxmZQCCnPu3Ya7dSnl+ia2ZrGr6MNcSMF0KI9PLdIomLTT4kklVcWYNJIom62tSGHwvk2hXH9D2iFPtwxU+ZvRXFAY9L8N0my/MrURjtA6FkblnSb/JF+ZG5r42o0BM3EqGA3MhFSsRSSQzQt6YBLks48B4GSAP1U4lkhlbqCESmZn56XGeMDLxz3IzwXczmfSb/Fi2tm6lbp80pgR+cWkA5vo0P5aKVMgQY0YkaiZhc4n5VRpJL6NVk0DvKwkpTz+TSszsbhSyK3ebr6bnZZraqeS+CdouOZK8Z5k5Wg44tdoHiWlVuyVH5EjuCMw2V9fv5TJ07fj99ZX8fhZHRKpr5uBo/igNB3OhQ+/WiWtGJw8Y1n2W6QnUTuXSmNuITg4HsSTT45SYxtiIZDppUkOyoHJxM5oFJOrNTT572eQVM/wIGmGYnJrQkU/NjvCmkSz8vo6ki6arpITW7/dDf4QNk0sqI1bRlOzO+PIn0TiS3231vT+in5HrKnOi3RnJjiYn4zgBhVeE5ji3fVNoR1NuCMBL64Qc7fc/ojB/BGlqpzklIGINAeQGZwHp16Frmfq//xFSyDI1mSnMsOjgTG7YHFRk5ilME/YyubmlkOiwWWpCIyRNi0wKsrhxQKIBU7vNoX/pyejKTTWFpZHoWKBvp7KYzFw7lh3CBPSmJTcJGJF+JT6yqcks+8fojSk3PRuVOE3eLGx6Vm7iPCpRmtxZrIlziSWNWOkxcRPHkvcOltaSRn5V0xEbDmTg1PLq9nOyFpvyzM22NOMiY57z9CL/jeysZUCJBdpE6VepNKc5h4sla4FWYuk85cipo5ubTWzKZy2dS1zUkCztul9JuDKQvnG9gc0S7YsaZC43SZT2vl+pxOFYL+c0Tg7IvtxE4kKgFGms1WEe97VN7GJpXwi0kQxA9IOKJ5vE//9gE9uLOpdo4S+eS5H+oZKoD5s4n3Px3EaC5lfDuJc1biRo9ONkmONNwEylLwVOln6bDHO7iZhpyV+knahfbBn/Im2Zy+djpel6aswYet7dTP/yeakbG2Kkk52dWTJLpbKzs5PvAIC7sUHqlpOodHVqbptf+kko/S9m25yquZ6Su+VE5mag6IE7020q82M8Tv/LR5O9L7Ftcsw5uZuBZG7Tihy309221f54GsHpn35sO29386MJ3KaVo59p1ODb2wk41Cpt70160tzm7AM30Enc2hjSp7u1D0P1seLh9Csf+XcK67tPOZ00eGujxE2njlSWkEefyuXmZzNAs+3GzpcAynbB/Nwslz9puayZB286xY7QrE2xtdFo0ZuvJgPaunJ5eLId0scvERSqkyH7dLM4mY97ixErPNg90MO3A2Nu1La2MKcY49WqeHh4OGjsla3m3a1DzS6Yf/7ZLoReXN9Z6OW9xoB+ubhajRcUCbMHeuRGbegt9Oyco8ViPJ8MGEbR0qRs03w2A81u//X3b7/9/Vc78KLlZEwT+7sDdpzJvEeJoBaK3kIPSgEMpDeeN+j5i5waTvua9+0QClMAp33vfrbBH4ESMa8baZA90KObG4hvO6GqI2oR6lkBEB6mXK76FnBQLBzfYlX3k0EYdpAB9TlqoZEqWPvitp0Q2xCEutdiPp80BuE2WO0Yui387KK0qr9xqrZcHNfJysO4Aw0GVgyJuVvchiAiW7Wwvf5Xk2IsCYPZc3/v4YkV761qtTr1Wab035aVEU5cbBr/CccaNCarnoh5YrdqydxEh6LM6VniTx6EKQ+rBQuFijOMpdZ2oeqxJMLYQJNx5hMR4jfRydreiKJEwyQoH6ZcdlCq1bXLsnZfaXEf20s/4mCQtRlVwvZGqRtPUZT9DBT6U/qNHN67Ta/+Y7P8471w7xumnGIYB+cwFSdp46mU9QBV69Ekkyk/nZWbJ17bq7yTMZ1wH8uEKdK02UveKCBxS7Dkzdqoh2WftFgs+a0s3/mNt3JA1///zv9UsyRy3GTjJG/WlrCNnkp6k0wPs9Tg/KfshUi1G4RZcx+KzcxRDSbxjxJJ2UYvfmaDulhRjIVPZ+XySRLMCR//YjC0AbGulrbBYezWk9pY7HxhmM9JMJ8RMFQxG1Snbj0ZuynoQvh0VFw779bxMGsuZMriR2aeFoFJ3RQ0Oh+ojibiPx6fm8tlLzlP3fJvJ2b+M5BjT8JZIGu71uhGuj2hPBYH8+A2f8ZgZu5/D0iY4mHI0TI30g0PBdTRCnI+rtDQ3magano18zP/GdDBQ9ufZG9xHF6tWUAME8zNd66fBYrmPR8ygpnZ0WEgakQ2nw5tCw7ysmA685JzAIZPzJBkVgz7mci24EFH0+aCJcaRPXK2Han5wCUzD+ahyX1kAjr4gN9lS2zD9oCj6ZBcxlRuDod7e007aNY8jJ2b13bINPf2hsMmIDMzNSZcwwS30udG0CosZKj2Jo1S0Y2cez8zu7nZTczDYqkxyej/R3TobbMl/JAD7vETKixkivbYzRs9237mTmjwXsZoUgd68TDe1lTij5/wl2zVFSxkLBwvCTh+xo9n1n5ihgW/pYG7Qz3kwSDeI1tUqGGKweHmvZ/M7AzAl3+ok1Ed2jCgR7Z4D9MZwWF4FnuExsNw4zIMzaH11Drgw3ScxxzB458mZ77As6BZ8zAP/LuwxGzBsAwAfsyR/QAqFVhlmAJ1k/Wcu9yERqDHjAmauYp5AJX1aDAVWmUscV2a5j03cUZz8z1nmCHi0I2Jino0mPXQNkT80xNy8xUPXjKzYDgva6J+qEPkQ9sK5ltE/BcDjta84yYBaW6+82EQTsZgRrjH6VGaawVzwmLRb/Jw7Vvmn+ra98Am7sjKNfJBh5RmiKLhp2lP+OnZE7Fp2RSWIfoRlIVCFUnjNZr6GQfjexlsIOOzVFObm/HY1moZ52m+O/GrAL77oQ6qlNNZMh+oW73D0HCLG//6MP9mLmSks9xlsAg86hhF40/UfvVhvnrmEpqUjbBIP+qY1psHBfE7evM0Qx/GMwzmeMpDDg+hZjQl+C/p5YDhN5flm/cSHKZUEmARgSm0TyZ18OndYtP87sJ8d1+BH6s+ORFgEYIpFO4f4YHj5QAXxot+8KGUx3uhZorBsKQG9g3Hq5qOn31zDAPuYDay0xgMplB9UKCutudMKv2wYX44/0INU1ceBFmEYQrte3BvYBhIzl9xhlGG9yLhAoPBuNqQDxoUi7iLAWFoVluCXM3tB1h+9gNT++tLoSyGgSkU1hOYq9mmsZLzd4RhlMka1DwYTKFwUQf4WsMuNl9pPvv21S4xgC8r9Qtg46AwhepjsS7cIqcf8MP1MvHa36gXHwHRgoRhFbQkHDr26pMLI762VC8J1klZmIJ58SiaCawc0KTJ+WsTEP315eNFZhc5JxjqaxdNRazzaTna3bdvd+JOVlKaF2APk4AptKsnE0EcZpIfP4Q7mCVlclKF5GN5GAdHwNmYozW/sx6ziJPVJVAkYCycoZJdd7zLULNZFGUogSIFQ2WuH7NxnCuEM6fJFeVxjQn7vGCoWg+NrOAZCtT+ktJ4SFioENd/Bg0vqFindKMAAAAASUVORK5CYII=",
    });
    setShowNameModal(false);
  };

  useEffect(() => {
    if (isTyping) startTypingMessage();
    else stopTypingMessage();
  }, [isTyping]);

  useEffect(() => {
    // If the component has not been rendered yet, scrollTarget.current will be null
    if (scrollTarget.current) {
      (scrollTarget.current as any).scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length + typingUsers.length]);

  return (
    <Layout>
      <div className={styles.chatRoomContainer}>
        {showNameModal && <NameModal onSubmit={handleNameSubmit} />}
        <div className={styles.chatRoomTopBar}>
          <h1>Room: {roomid}</h1>
          {user && <h2>User: {user.name}</h2>}
          {user && <UserAvatar user={user}></UserAvatar>}
        </div>
        <Users users={users}></Users>
        <div className={styles.messagesContainer}>
          <ol className={styles.messagesList}>
            {messages.map((message, i) => {
              message.sentAt += timeDiff;
              return (
                <li key={i}>
                  <ChatMessage message={message}></ChatMessage>
                </li>
              );
            })}
            {typingUsers.map((user, i) => (
              <li key={messages.length + i}>
                <TypingMessage user={user}></TypingMessage>
              </li>
            ))}
          </ol>
          <div ref={scrollTarget}></div>
        </div>
        <NewMessageForm
          newMessage={newMessage}
          handleNewMessageChange={handleNewMessageChange}
          handleStartTyping={startTyping}
          handleStopTyping={stopTyping}
          handleSendMessage={handleSendMessage}
        ></NewMessageForm>
      </div>
    </Layout>
  );
}
