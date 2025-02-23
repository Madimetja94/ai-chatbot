"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState<
    { role: string; content: string; chatbot?: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [chatbotType, setChatbotType] = useState("openai");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedChatbotType = localStorage.getItem("chatbotType");
    if (savedChatbotType) {
      setChatbotType(savedChatbotType);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatbotType", chatbotType);
  }, [chatbotType]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = { role: "user", content: input, chatbot: chatbotType };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, chatbotType }),
    });

    const data = await response.json();
    if (data.reply || data.choices) {
      const botMessage = {
        role: "assistant",
        content:
          chatbotType === "openai"
            ? data.choices[0].message.content
            : data.reply,
        chatbot: chatbotType,
      };
      setMessages((prev) => [...prev, botMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">AI Chatbot</h1>
        <div className="flex items-center mb-4">
          <label htmlFor="chatbotType" className="mr-2 font-medium">
            Chatbot:
          </label>
          <select
            id="chatbotType"
            value={chatbotType}
            onChange={(e) => setChatbotType(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none"
          >
            <option value="openai">OpenAI</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
        <div className="h-96 overflow-y-auto border p-3 rounded mb-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 my-2 rounded-lg max-w-[80%] ${
                msg.role === "user"
                  ? "bg-blue-500 text-white ml-auto"
                  : msg.chatbot === "openai"
                  ? "bg-green-200 text-gray-800"
                  : "bg-purple-200 text-gray-800"
              }`}
            >
              <div className="text-sm font-semibold mb-1">
                {msg.role === "user"
                  ? "You"
                  : msg.chatbot === "openai"
                  ? "OpenAI"
                  : "DeepSeek"}
              </div>
              <div>{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="p-3 my-2 bg-gray-200 text-gray-800 rounded-lg max-w-[80%]">
              <div className="text-sm font-semibold mb-1">Loading...</div>
            </div>
          )}
        </div>
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 border p-2 rounded-l focus:outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
