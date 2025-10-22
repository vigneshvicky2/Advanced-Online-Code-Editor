"use client"
import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState, useTransition } from "react";

export type Message = {
  role: "user" | "model";
  text: string;
};

function GemChat({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [isModelThinking, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when chat history changes
  useEffect(() => {
    // Scroll to bottom
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  
    // Disable background scroll safely
    if (typeof window !== "undefined" && document?.body) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
  
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [history]);
  

   const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage: Message = {
    role: "user",
    text: input,
  };

  setHistory((prev) => [...prev, userMessage]);
  setInput("");

  startTransition(async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

      // Convert full history to Gemini-compatible "contents"
      const chatHistory = [
        {
          role: "model",
          parts: [
            {
              text:
                "You are **CodePhoenix**, working in the Code Craft platform — a helpful, friendly, and technical coding assistant. " +
                "Always respond concisely and use markdown for code.",
            },
          ],
        },
        // Map previous messages
        ...history.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        })),
        // Include current user message
        {
          role: "user",
          parts: [{ text: userMessage.text }],
        },
      ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: chatHistory }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const modelResponse: Message = {
        role: "model",
        text:
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, no response from Gemini.",
      };

      setHistory((prev) => [...prev, modelResponse]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setHistory((prev) => [
        ...prev,
        { role: "model", text: "Oops, something went wrong. Please try again." },
      ]);
    }
  });
};
  // Send message on Enter (without Shift)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="relative flex flex-col gap-4 bg-[#12121a] rounded-xl px-8 py-6 w-full max-w-2xl shadow-lg text-white">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-lg font-bold hover:text-red-500"
          aria-label="Close chat"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-center">CodePhoenix Chat</h2>

        <div className="h-96 overflow-y-auto overflow-x-hidden p-4 bg-[#1e1e2e] rounded-md">
          {history.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Ask me anything...</div>
          ) : (
            <>
              {history.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 p-3 rounded-md break-words ${
                    msg.role === "user"
                      ? "bg-gray-600 text-white"
                      : "bg-transparent border border-gray-600 text-white"
                  }`}
                >
                  <strong>{msg.role === "user" ? "You" : "CodePhoenix"}:</strong>
                  <div className="mt-1 prose prose-invert max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isModelThinking && (
                <div className="italic text-gray-400">CodePhoenix is thinking...</div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex space-x-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isModelThinking}
            className={`flex-grow bg-[#1e1e2e] text-white border border-gray-600 rounded-xl px-5 py-3 focus:outline-none h-12 ${
              isModelThinking ? "opacity-70" : ""
            }`}
          />
          <button
            onClick={handleSend}
            disabled={isModelThinking}
            className={`bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 px-5 py-3 rounded-xl h-12 ${
              isModelThinking ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {isModelThinking ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GemChat;
