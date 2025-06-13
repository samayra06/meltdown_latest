import { useState } from "react";
import { addReplyToMeltdown } from "../utils/firestore";

export default function ReplyInput({ meltdownId }: { meltdownId: string }) {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await addReplyToMeltdown(meltdownId, text);
    setText("");
  };

  return (
    <div style={{ marginTop: 8 }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="write a gentle reply…"
        style={{ padding: "6px", borderRadius: "6px", width: "70%" }}
      />
      <button
        onClick={handleSubmit}
        style={{
          background: "#5a0000",
          color: "white",
          border: "none",
          padding: "6px 12px",
          marginLeft: "8px",
          borderRadius: "6px",
        }}
      >
        send
      </button>
    </div>
  );
}
