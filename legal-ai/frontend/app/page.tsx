"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { ChatWindow } from "../components/ChatWindow";
import { sendQuestion } from "../lib/api";

export interface Message {
  id?: string;
  role: "user" | "ai";
  content: string;
  citations?: any[];
  isNew?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const activeMessages = activeSession ? activeSession.messages : [];
  
  // Loading status is strictly scoped to the session where the request was sent
  const isCurrentSessionLoading = loadingSessionId === activeSessionId;

  const handleNewChat = () => {
    setActiveSessionId(null);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
  };

  const handleSendMessage = async (text: string) => {
    let currentId = activeSessionId;
    let newSessions = [...sessions];

    // If starting a new session
    if (!currentId) {
      currentId = Date.now().toString();
      const newSession: ChatSession = {
        id: currentId,
        title: text.length > 25 ? text.slice(0, 25) + "..." : text,
        messages: [],
      };
      newSessions = [newSession, ...newSessions];
      setActiveSessionId(currentId);
    }

    const userMsgId = `${currentId}-${Date.now()}-user`;
    newSessions = newSessions.map((session) => {
      if (session.id === currentId) {
        return {
          ...session,
          messages: [...session.messages, { id: userMsgId, role: "user", content: text, isNew: false }],
        };
      }
      return session;
    });

    setSessions(newSessions);
    setLoadingSessionId(currentId);

    try {
      const response = await sendQuestion(text);
      const aiMsgId = `${currentId}-${Date.now()}-ai`;
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === currentId) {
            return {
              ...session,
              messages: [
                ...session.messages,
                {
                  id: aiMsgId,
                  role: "ai",
                  content: response.answer,
                  citations: response.citations,
                  isNew: true, // Only set to true for newly arrived AI response
                },
              ],
            };
          }
          return session;
        })
      );
    } catch (error) {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === currentId) {
            return {
              ...session,
              messages: [
                ...session.messages,
                {
                  id: `${currentId}-${Date.now()}-err`,
                  role: "ai",
                  content:
                    "Maaf, terjadi kesalahan saat menghubungi server. Pastikan backend sudah berjalan.",
                  isNew: false,
                },
              ],
            };
          }
          return session;
        })
      );
    } finally {
      setLoadingSessionId(null);
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-background">
      <Sidebar
        sessions={sessions.map((s) => ({ id: s.id, title: s.title }))}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
      />
      <ChatWindow
        messages={activeMessages}
        isLoading={isCurrentSessionLoading}
        activeSessionId={activeSessionId}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
