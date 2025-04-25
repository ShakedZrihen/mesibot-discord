import { useState, KeyboardEvent, TouchEvent } from "react";
import { useAppContext } from "../../../../context/useAppContext";
import { pressTheBuzzer } from '../../../../services/mesibotApi'

interface BuzzerButtonProps {
  selectedColorValue: string;
  onPlay: () => void;
  small?: boolean;
}

export function BuzzerButton({ selectedColorValue, onPlay, small }: BuzzerButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const { party, connectedUser } = useAppContext();

  const handlePressStart = () => {
    setIsPressed(true);
    setTimeout(() => {
      handlePressEnd();
    }, 100);
    onPlay();
  };

  const handlePressEnd = () => {
    setTimeout(() => {
      setIsPressed(false);
    }, 100);

    if(!party || !party._id || !connectedUser) {
      console.log("Party, connectedUser", party, connectedUser)
      return;
    }
    console.log("Pressing buzzer for", connectedUser.name, "in party", party._id);

    pressTheBuzzer(party?._id, connectedUser, true)
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      handlePressStart();
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      handlePressEnd();
    }
  };

  return (
    <button
      className={`buzzer-button ${isPressed ? "active" : ""}`}
      onMouseDown={handlePressStart}
      // onMouseUp={handlePressEnd}
      // onMouseLeave={handlePressEnd}
      onTouchStart={(e: TouchEvent) => {
        e.preventDefault();
        handlePressStart();
      }}
      onTouchEnd={(e: TouchEvent) => {
        e.preventDefault();
        handlePressEnd();
      }}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        width: small ? "30vw" : "90vw",
        height: small ? "30vw" : "90vw",
        maxWidth: small ? "200px" : "500px",
        maxHeight: small ? "200px" : "500px",
        userSelect: "none",
        touchAction: "manipulation",
        outline: "none",
        transition: "transform 0.1s ease, filter 0.1s ease",
        transform: isPressed ? "scale(0.9)" : "scale(1)",
        filter: isPressed
          ? `drop-shadow(0 0 20px ${selectedColorValue})`
          : `drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.5))`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: "rotateX(25deg)" }}
      >
        <g style={{ transformOrigin: "center", transform: "scale(0.8)" }}>
          <circle
            cx="50%"
            cy="50%"
            r="50%"
            fill={selectedColorValue}
            style={{
              transition: "filter ease 0.1s",
            }}
          />
          <ellipse
            cx="50%"
            cy="50%"
            rx="20%"
            ry="10%"
            fill="white"
            fillOpacity="30%"
            style={{
              transform: "rotate(-36deg) translateY(-34%)",
              transformOrigin: "center",
            }}
          />
        </g>
      </svg>
    </button>
  );
}
