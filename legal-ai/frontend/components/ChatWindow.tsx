"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { LoadingAnimation } from "./LoadingAnimation";
import type { Message } from "../app/page";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  activeSessionId: string | null;
  onSendMessage: (text: string) => void;
}

export function ChatWindow({
  messages,
  isLoading,
  activeSessionId,
  onSendMessage,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Apa itu PKWT?",
    "Hak cuti tahunan",
    "Syarat PHK di PP 35/2021",
    "Aturan jam kerja UU Ciptaker",
  ];

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-screen bg-background relative">
      {/* Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-surface/50 backdrop-blur-md z-10">
        <h2 className="font-semibold text-white/90">Legal AI Assistant</h2>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          ZeroGPU Active ⚡
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 ring-1 ring-white/10">
                <Sparkles size={32} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Selamat datang di Legal AI Indonesia
              </h2>
              <p className="text-white/50 max-w-md mb-8">
                Asisten hukum yang didukung AI untuk menjawab pertanyaan seputar UU Cipta Kerja dan Peraturan Pemerintah terkait ketenagakerjaan.
              </p>

              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(q)}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 text-white/80 transition-all text-sm text-left flex items-center justify-between group cursor-pointer"
                  >
                    {q}
                    <Send
                      size={14}
                      className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-20">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id || `${activeSessionId || "new"}-${idx}`}
                  {...msg}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <LoadingAnimation />
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 pt-0 shrink-0">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative flex items-end gap-2 bg-surface border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-primary/50 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Tanyakan tentang hukum ketenagakerjaan..."
              className="w-full bg-transparent text-white placeholder-white/30 p-3 outline-none resize-none min-h-[56px] max-h-[200px] scrollbar-hide"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Send size={20} className={isLoading ? "opacity-0" : "opacity-100"} />
              {isLoading && (
                <div className="absolute w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
            </button>
          </div>
          <div className="text-center mt-3 text-xs text-white/30">
            Legal AI dapat membuat kesalahan. Harap periksa kembali sumber yang diberikan.
          </div>
        </div>
      </div>
    </div>
  );
}
