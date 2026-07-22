import { FileText, ExternalLink, Globe } from "lucide-react";

export interface CitationProps {
  title: string;
  page?: number;
  pasal?: string;
  url?: string;
  source: string; // "dokumen_lokal" | "duckduckgo"
}

export function CitationCard({ title, page, pasal, url, source }: CitationProps) {
  const isWeb = source === "duckduckgo" || source === "web";
  
  // Decide icon and color based on type
  const Icon = isWeb ? Globe : FileText;
  const badgeColor = isWeb 
    ? "bg-orange-500/10 text-orange-400 border-orange-500/20" 
    : title.includes("PP") 
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  return (
    <div className="group relative flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors w-64 shrink-0">
      <div className="flex items-start justify-between gap-3">
        <div className={`p-2 rounded-lg border ${badgeColor}`}>
          <Icon size={16} />
        </div>
        {url && (
          <a 
            href={url} 
            target="_blank" 
            rel="noreferrer"
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      
      <div className="mt-1">
        <h4 className="text-sm font-medium text-white/90 line-clamp-2" title={title}>
          {title}
        </h4>
        
        {!isWeb && (page || pasal) && (
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-white/50">
            {page && <span>Hal. {page}</span>}
            {page && pasal && <span>•</span>}
            {pasal && <span className="text-primary/80">{pasal}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
