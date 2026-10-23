import { useState } from "react";
import { askGemini } from "./geminiClient";

export function useGeminiChat() {
  const [messages, setMessages] = useState<{ text: string; user: boolean }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    setMessages(prev => [...prev, { text, user: true }]);
    setLoading(true);

    const response = await askGemini(text);
    setMessages(prev => [...prev, { text: response, user: false }]);
    setLoading(false);
  };

  return { messages, sendMessage, loading };
}
