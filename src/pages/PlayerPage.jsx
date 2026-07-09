import { useParams, Link } from 'react-router-dom';
import { User, Sparkles } from 'lucide-react';
import { getPlayer, fmt, fmtPct } from '../utils/data';
import { generatePlayerInsight } from '../components/AIAnalyst';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function PlayerPage() {
  const { id } = useParams();
  const player = getPlayer(id);

  if (!player) {
    return (
      <div className="border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto bg-white/80 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-slate-900 uppercase">Player Not Found</h3>
        <p className="text-xs text-slate-500">Player with ID {id} was not found in the 2025-2026 regular season database.</p>
        <Link to="/" className="btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const aiInsight = generatePlayerInsight(player);

  const radarData = [
    { subject: 'Scoring', A: player.stats.points_p36 * 2.5, fullMark: 100 },
    { subject: 'Playmaking', A: player.stats.assistPercentage * 200, fullMark: 100 },
    { subject: 'Defense', A: (150 - player.stats.defensiveRating) * 2, fullMark: 100 },
    { subject: 'Rebound', A: player.stats.reboundsTotal * 6, fullMark: 100 },
    { subject: 'Shooting', A: player.stats.trueShootingPercentage * 200, fullMark: 100 },
    { subject: 'Usage', A: player.stats.usagePercentage * 300, fullMark: 100 },
  ];

  return (
    <div className="pt-16 pb-20 space-y-12 max-w-6xl mx-auto px-4 md:px-0">
      
      {/* ─── HEADER / BIOGRAPHY ───────────────────────────────────── */}
      <section className="border-b border-slate-200 pb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 bg-slate-100 border border-slate-200 rounded-none overflow-hidden shrink-0 flex items-center justify-center">
            <img 
              src={`https://cdn.nba.com/headshots/nba/latest/260x190/${player.personId}.png`}
              alt={player.fullName}
              className="w-full h-full object-cover object-bottom"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://cdn.nba.com/headshots/nba/latest/260x190/fallback.png";
              }}
            />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-slate-900 tracking-tight uppercase leading-none">
              {player.fullName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 uppercase tracking-wider">
              <span className="font-bold text-slate-900">
                <Link to={`/team/${player.team}`} className="hover:text-brand-500">
                  {player.team}
                </Link>
              </span>
              <span>•</span>
              <span>Position: {player.position}</span>
              <span>•</span>
              <span>Games Played: {player.gamesPlayed}</span>
            </div>
          </div>
        </div>

        <div>
          <span
            className="text-xs font-mono px-4 py-2 border font-bold tracking-widest uppercase rounded-none"
            style={{ borderColor: `${player.cluster_color}40`, color: player.cluster_color }}
          >
            {player.cluster_name}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── STATISTIK DETAIL ───────────────────────────────────── */}
        <div className="lg:col-span-7 border border-slate-200 bg-white/50 p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900 uppercase tracking-wider">Season Averages</h3>
            <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mt-1">Traditional and advanced season statistics averages</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Points', val: fmt(player.stats.points), unit: 'PPG' },
              { label: 'Assists', val: fmt(player.stats.assists), unit: 'APG' },
              { label: 'Rebounds', val: fmt(player.stats.reboundsTotal), unit: 'RPG' },
              { label: 'True Shooting', val: fmtPct(player.stats.trueShootingPercentage), unit: 'TS%' },
              { label: 'Steals', val: fmt(player.stats.steals), unit: 'SPG' },
              { label: 'Blocks', val: fmt(player.stats.blocks), unit: 'BPG' },
              { label: 'Usage Rate', val: fmtPct(player.stats.usagePercentage), unit: 'USG%' },
              { label: 'Minutes', val: fmt(player.stats.numMinutes), unit: 'MPG' },
            ].map((s, i) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{s.label}</div>
                <div className="text-xl font-display font-bold text-slate-900 tabular-nums flex items-baseline gap-1 mt-1">
                  {s.val}
                  <span className="text-[10px] text-slate-500 font-mono font-normal">{s.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Shooting Splits */}
          <div className="p-5 bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="font-display font-bold text-xs text-slate-700 uppercase tracking-widest">Shooting Splits</h4>
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-200">
              <div>
                <div className="text-lg font-bold text-slate-900 font-mono">{fmtPct(player.stats.fieldGoalsPercentage)}</div>
                <div className="text-[9px] text-slate-500 font-mono uppercase mt-1">FG%</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 font-mono">{fmtPct(player.stats.threePointersPercentage)}</div>
                <div className="text-[9px] text-slate-500 font-mono uppercase mt-1">3PT%</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 font-mono">{fmtPct(player.stats.freeThrowsPercentage)}</div>
                <div className="text-[9px] text-slate-500 font-mono uppercase mt-1">FT%</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RADAR CHART ARCHETYPE ─────────────────────────────── */}
        <div className="lg:col-span-5 border border-slate-200 bg-white/50 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900 uppercase tracking-wider">Dimension Metrics</h3>
            <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mt-1">Relative visualization of player tactical profile</p>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center my-6">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} fontClassName="font-mono uppercase" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="none" />
                <Radar name={player.fullName} dataKey="A" stroke={player.cluster_color} fill={player.cluster_color} fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── AI INSIGHT & ANALYSIS (EMOJI FREE, SCRAPPING TEXT DESIGN) ─ */}
      <section className="p-6 md:p-8 border-l-2 border-brand-500 bg-brand-50">
        <div className="space-y-4">
          <h3 className="text-xs font-mono text-brand-500 uppercase tracking-[0.2em] font-bold">Scouting Report Analysis</h3>
          <p className="text-sm text-slate-700 leading-relaxed font-sans">
            {aiInsight}
          </p>
        </div>
      </section>

      {/* ─── SIMILAR PLAYERS (SportCover Grid style) ────────────────── */}
      <section className="space-y-6">
        <div>
          <h3 className="text-lg font-display font-bold text-slate-900 uppercase tracking-wider">Similar Profiles</h3>
          <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mt-1">Players with the closest statistical similarity based on the Nearest Neighbors algorithm</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {player.similar_players.slice(0, 3).map((sim) => (
            <Link
              key={sim.personId}
              to={`/player/${sim.personId}`}
              className="p-6 border border-slate-200 bg-slate-50 hover:border-brand-500/30 hover:bg-white transition-all duration-300 flex justify-between items-center group rounded-none shadow-sm"
            >
              <div className="space-y-2">
                <h4 className="font-display font-bold text-sm text-slate-900 group-hover:text-brand-500 transition-colors uppercase tracking-wider">
                  {sim.name}
                </h4>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  {sim.team} • SIMILARITY: {fmtPct(sim.similarity)}
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-brand-500 border border-brand-500/30 px-3 py-1.5 hover:bg-brand-500 hover:text-white transition-colors duration-200 uppercase tracking-wider">
                View
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
