import { useState, useEffect, useRef } from "react";

const RadioPlayer = () => {
  const [currentSong, setCurrentSong] = useState<string>("");
  const [startTime, setStartTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      console.log("🔄 Connecting to WebSocket...");
      wsRef.current = new WebSocket("ws://localhost:3001");

      wsRef.current.onopen = () => console.log("✅ WebSocket connected!");

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== "ping") {
            // Ignore ping messages
            console.log("📩 WebSocket Message Received:", data);
            setCurrentSong(data.id);
            setStartTime(data.startTime);
            setError(null);
          }
        } catch (err) {
          console.error("❌ Error parsing WebSocket message:", err);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setError("WebSocket connection error.");
      };

      wsRef.current.onclose = () => {
        console.warn("⚠️ WebSocket closed. Reconnecting in 3s...");
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => wsRef.current?.close();
  }, []);

  // ✅ Function to play the radio stream
  const playRadio = () => {
    if (audioRef.current) {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      audioRef.current.src = `http://localhost:3001/stream?seek=${elapsedTime}`;
      audioRef.current.play().catch((err) => {
        console.error("❌ Error playing audio:", err);
        setError("Audio playback failed.");
      });
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h3>🎵 Now Playing: {currentSong ? `YouTube - ${currentSong}` : "Loading..."}</h3>
      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      <audio ref={audioRef} controls />

      <button onClick={playRadio}>▶️ Play Radio</button>
    </div>
  );
};

export default RadioPlayer;
