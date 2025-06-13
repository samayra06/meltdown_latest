import { useEffect, useState } from "react";
import { OrbMemory, saveOrb, subscribeToOrbs } from "../lib/firestore";

export default function FloatingEmotionCanvas() {
  const [orbs, setOrbs] = useState<OrbMemory[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToOrbs(setOrbs);
    return () => unsubscribe();
  }, []);

  const handleAddOrb = async () => {
    const message =
      "this is what it feels like to melt inside a memory. sometimes it floods. sometimes it fades. sometimes it screams.";

    const newOrb: Omit<OrbMemory, "id"> = {
      x: Math.random() * (window.innerWidth - 200),
      y: Math.random() * (window.innerHeight - 200),
      size: getOrbSize(message),
      color: getRandomColor(),
      preview: limitLength(message),
      fullText: message,
      timestamp: new Date().toISOString(),
    };

    await saveOrb(newOrb);
  };

  const limitLength = (text: string, max = 100) => {
    return text.length > max ? text.slice(0, max) + "…" : text;
  };

  const getOrbSize = (text: string) => {
    const base = 100;
    const factor = Math.min(text.length * 3, 250);
    return base + factor;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#5a0000]">
      {orbs.map((orb, index) => (
        <div
          key={orb.id || index}
          className="absolute transition-transform duration-200 hover:scale-105"
          style={{
            left: orb.x,
            top: orb.y,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            backgroundColor: orb.color,
            borderRadius: "50%", // ensures perfect circle
            overflow: "hidden", // clips text inside circle
            boxShadow: "0 0 20px rgba(255,255,255,0.2)",
            animation: "float 12s ease-in-out infinite",
            animationDelay: `${index * 0.2}s`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
            fontFamily: "droid sans mono, sans-serif",
            textTransform: "lowercase",
            textAlign: "center",
            userSelect: "none",
          }}
        >
          <span
            style={{
              color: "white",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
              width: "90%",
              height: "90%",
              fontSize:
                orb.size < 130 ? "10px" : orb.size > 200 ? "14px" : "12px",
              lineHeight: "1.2",
            }}
          >
            {orb.preview}
          </span>
        </div>
      ))}

      <button
        onClick={handleAddOrb}
        className="absolute bottom-4 left-4 bg-white text-[#5a0000] px-4 py-2 rounded-2xl text-xs font-bold"
      >
        Add Orb
      </button>
    </div>
  );
}

// ✅ Required: define this helper for orb colors
function getRandomColor() {
  const palette = ["#ff8ca3", "#ffe9ee", "#fa6a6a", "#fff3f3", "#ffb6c1"];
  return palette[Math.floor(Math.random() * palette.length)];
}
