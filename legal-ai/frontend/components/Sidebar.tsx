import { Plus, MessageSquare, Info, Code, Scale } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
}

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: SidebarProps) {
  return (
    <div className="w-72 bg-surface border-r border-white/5 h-screen flex flex-col p-4 shrink-0">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-2 py-4 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
          <Scale size={18} className="text-white" />
        </div>
        <h1 className="font-bold text-lg text-white tracking-tight">
          Legal AI <span className="text-white/50">Indonesia</span>
        </h1>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="flex items-center gap-2 w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-200 mb-6 group cursor-pointer"
      >
        <Plus size={18} className="text-primary group-hover:scale-110 transition-transform" />
        <span className="font-medium text-sm">Chat Baru</span>
      </button>

      {/* History */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 px-2">
          Riwayat (Sementara)
        </div>
        <div className="flex flex-col gap-1">
          {sessions.length === 0 ? (
            <div className="text-xs text-white/30 px-3 py-2 italic">
              Belum ada riwayat chat
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left cursor-pointer ${
                  activeSessionId === session.id
                    ? "bg-white/10 text-white font-medium border border-white/10"
                    : "hover:bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                <MessageSquare size={16} className="text-white/40 shrink-0" />
                <span className="text-sm truncate">{session.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Bottom Links */}
      <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-1">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors text-sm"
        >
          <Info size={16} />
          <span>Tentang</span>
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors text-sm"
        >
          <Code size={16} />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  );
}
