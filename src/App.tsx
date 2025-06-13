import { useEffect, useState } from "react";
import "./styles.css";
import {
  submitMeltdown,
  fetchMeltdowns,
  addReplyToMeltdown,
  burstMeltdown,
} from "./utils/firestore";
import { auth } from "./firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

// Emotion type setup

type EmotionFlavor =
  | "numb"
  | "angry"
  | "sad"
  | "hopeful"
  | "longing"
  | "joyful"
  | "relieved"
  | "grateful";

type Emotion = {
  id: string;
  text: string;
  timestamp: string;
  x: number;
  y: number;
  gradient: string;
  animation: string;
  tag: string;
  flavor: EmotionFlavor;
  replies: string[];
  userId?: string;
  burst?: boolean;
};

// Helper to size orbs
const getOrbSize = (text: string) => {
  const base = 100;
  const factor = Math.min(text.length * 3, 250);
  return base + factor;
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [text, setText] = useState("");
  const [flavor, setFlavor] = useState<EmotionFlavor>("sad");
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [burstingOrbs, setBurstingOrbs] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        loadMeltdowns();
      } else {
        const result = await signInAnonymously(auth);
        setUserId(result.user.uid);
        loadMeltdowns();
      }
    });
    return () => unsubscribe();
  }, []);

  const flavorStyles: Record<
    EmotionFlavor,
    { gradient: string; animation: string; tag: string }
  > = {
    numb: {
      gradient: "linear-gradient(135deg, #6b5e5e, #a89c9c)",
      animation: "floatGentle",
      tag: "quiet",
    },
    angry: {
      gradient: "linear-gradient(135deg, #b00020, #ff5e5e)",
      animation: "floatGentle",
      tag: "burning",
    },
    sad: {
      gradient: "linear-gradient(135deg, #661f3d, #943f5f)",
      animation: "floatGentle",
      tag: "drift",
    },
    hopeful: {
      gradient: "linear-gradient(135deg, #db6a7b, #ffc2bc)",
      animation: "floatGentle",
      tag: "rising",
    },
    longing: {
      gradient: "linear-gradient(135deg, #884f5f, #d49ea0)",
      animation: "floatGentle",
      tag: "missing",
    },
    joyful: {
      gradient: "linear-gradient(135deg, #fcb69f, #ffdde1)",
      animation: "floatGentle",
      tag: "light",
    },
    relieved: {
      gradient: "linear-gradient(135deg, #a58da5, #ffe8f0)",
      animation: "floatGentle",
      tag: "ease",
    },
    grateful: {
      gradient: "linear-gradient(135deg, #c97c7c, #f5d7d7)",
      animation: "floatGentle",
      tag: "thankful",
    },
  };

  const loadMeltdowns = async () => {
    const raw = await fetchMeltdowns();
    const mapped = raw.map((item: any) => {
      const style =
        flavorStyles[item.flavor as EmotionFlavor] || flavorStyles.sad;
      return {
        id: item.id,
        text: item.text,
        flavor: item.flavor,
        replies: item.replies || [],
        burst: item.burst || false,
        userId: item.userId,
        timestamp: new Date().toLocaleString(),
        x: item.x ?? Math.random() * 60 + 20,
        y: item.y ?? Math.random() * 60 + 20,
        gradient: style.gradient,
        animation: style.animation,
        tag: style.tag,
      };
    });
    setEmotions(mapped);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setEmotions((prev) =>
        prev.map((emo) => ({
          ...emo,
          x: Math.min(90, Math.max(10, emo.x + Math.random() * 4 - 2)),
          y: Math.min(90, Math.max(10, emo.y + Math.random() * 4 - 2)),
        }))
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !userId) return;

    const style = flavorStyles[flavor];
    const data = {
      text: text.trim().toLowerCase(),
      flavor,
      replies: [],
      x: Math.random() * 60 + 20,
      y: Math.random() * 60 + 20,
      gradient: style.gradient,
      animation: style.animation,
      tag: style.tag,
      userId,
      burst: false,
    };

    await submitMeltdown(data);
    setText("");
    loadMeltdowns();
  };

  const submitReply = async () => {
    if (!replyText.trim() || !replyId) return;
    await addReplyToMeltdown(replyId, replyText.trim().toLowerCase());
    setReplyText("");
    setReplyId(null);
    loadMeltdowns();
  };

  const handleReply = (id: string) => setReplyId(id);

  const handleBurst = async (id: string) => {
    setBurstingOrbs((prev) => [...prev, id]);
    setTimeout(async () => {
      await burstMeltdown(id);
      setBurstingOrbs((prev) => prev.filter((orbId) => orbId !== id));
      loadMeltdowns();
    }, 10000);
  };

  if (showSplash) {
    return (
      <div className="splash-screen">
        <h1>this space is for you</h1>
        <p>to leave a trace of what you're feeling.</p>
        <p>when you're ready, enter.</p>
        <button onClick={() => setShowSplash(false)}>enter</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1>meltdown</h1>

      <form onSubmit={handleSubmit} className="emotion-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="type your meltdown moment..."
        />
        <div className="flavor-picker">
          {Object.keys(flavorStyles).map((f) => (
            <button
              key={f}
              type="button"
              className={`flavor-btn ${flavor === f ? "selected" : ""}`}
              onClick={() => setFlavor(f as EmotionFlavor)}
            >
              {f}
            </button>
          ))}
        </div>
        <button type="submit">log it</button>
      </form>

      <div className="emotion-canvas">
        {emotions.map((emo) => {
          if (emo.burst) return null;
          const isBursting = burstingOrbs.indexOf(emo.id) !== -1;

          return (
            <div
              key={emo.id}
              className={`emotion-orb ${emo.animation}`}
              style={{
                top: `${emo.y}%`,
                left: `${emo.x}%`,
                background: emo.gradient,
                width: `${getOrbSize(emo.text)}px`,
                height: `${getOrbSize(emo.text)}px`,
              }}
              title={emo.timestamp}
              onClick={() => {
                if (emo.userId === userId && !isBursting) {
                  handleBurst(emo.id);
                } else {
                  handleReply(emo.id);
                }
              }}
            >
              {isBursting ? (
                <div className="orb-text italic-message">
                  *you let it go. it drifted into the deep.*
                </div>
              ) : (
                <>
                  <div className="orb-text">{emo.text}</div>
                  <div className="orb-tag">{emo.tag}</div>
                  {emo.replies.length > 0 && (
                    <div className="replies">
                      {emo.replies.map((rep, i) => (
                        <div key={i} className="reply">
                          ↳ {rep}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {replyId && (
        <div className="reply-box">
          <textarea
            placeholder="type your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button onClick={submitReply}>reply</button>
        </div>
      )}
    </div>
  );
}
