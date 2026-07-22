"use client";

import { useEffect, useState } from "react";
import { User, Sparkles } from "lucide-react";
import { CitationCard, type CitationProps } from "./CitationCard";

// Global tracker of message IDs that have already finished their typewriter animation
const animatedMessageIds = new Set<string>();

interface MessageBubbleProps {
  id?: string;
  role: "user" | "ai";
  content: string;
  citations?: CitationProps[];
}

export function MessageBubble({ id, role, content, citations }: MessageBubbleProps) {
  const isUser = role === "user";
  
  // Generate a unique identifier for this message
  const msgKey = id || content.slice(0, 30);
  
  // Only animate if it's an AI message AND has never been animated before
  const shouldAnimate = !isUser && !animatedMessageIds.has(msgKey);
  
  const [displayedText, setDisplayedText] = useState(shouldAnimate ? "" : content);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedText(content);
      return;
    }

    let currentIndex = 0;
    setDisplayedText("");
    
    // Typewriter animation running once for new AI message
    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        const chunk = content.slice(0, currentIndex + 4);
        setDisplayedText(chunk);
        currentIndex += 4;
      } else {
        setDisplayedText(content);
        animatedMessageIds.add(msgKey);
        clearInterval(interval);
      }
    }, 10);

    return () => {
      clearInterval(interval);
      animatedMessageIds.add(msgKey);
    };
  }, [content, shouldAnimate, msgKey]);

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`flex gap-4 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
          isUser 
            ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
            : "bg-surface border border-white/10"
        }`}>
          {isUser ? <User size={20} className="text-white" /> : <Sparkles size={20} className="text-primary" />}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
          <div className={`px-5 py-4 rounded-2xl ${
            isUser 
              ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/10 rounded-tr-sm" 
              : "glass-panel text-white/90 rounded-tl-sm leading-relaxed"
          }`}>
            <p className="whitespace-pre-wrap">{displayedText}</p>
          </div>

          {/* Citations section if any */}
          {citations && citations.length > 0 && (
            <div className="mt-2 w-full">
              <div className="text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
                Sumber Referensi
              </div>
              <div className="flex flex-wrap gap-3">
                {citations.map((cit, idx) => (
                  <CitationCard key={idx} {...cit} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
