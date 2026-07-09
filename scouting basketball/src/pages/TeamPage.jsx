import { useParams, Link } from 'react-router-dom';
import { getTeam, fmt, fmtPct, getTeamLogoUrl } from '../utils/data';
import { generateTeamInsight } from '../components/AIAnalyst';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function TeamPage() {
  const { name } = useParams();
  const team = getTeam(name);

  if (!team) {
    return (
      <div className="border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto bg-white/80 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-slate-900 uppercase">Team Not Found</h3>
        <p className="text-xs text-slate-500">Team with name "{name}" was not found in the database.</p>
        <Link to="/" className="btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const aiInsight = generateTeamInsight(team);

  const pieData = Object.entries(team.cluster_composition).map(([key, val]) => {
    const colors = {
      'Pure 3PT Shooter':     '#f97316',
      'Two-Way Energy Wing':  '#22c55e',
      'Interior Anchor':      '#ef4444',
      'Secondary Playmaker':  '#3b82f6',
      'Stretch Big':          '#06b6d4',
      'Franchise Cornerstone': '#f59e0b',
      'Bench Rotation Piece': '#9ca3af',
    };
    return { name: key, value: val, color: colors[key] || '#6b7280' };
  });

  return (
    <div className="pt-16 pb-20 space-y-12 max-w-6xl mx-auto px-4 md:px-0">
      
      {/* ─── HEADER / SUMMARY ────────────────────────────────────── */}
      <section className="border-b border-slate-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-none overflow-hidden shrink-0 flex items-center justify-center p-2 shadow-sm">
            <img 
              src={getTeamLogoUrl(team.team)} 
              alt={team.team} 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-slate-900 tracking-tight uppercase leading-none">
              {team.team}
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest mt-2">
              <span>NBA Roster Profile</span>
              <span>•</span>
              <span>Roster Count: {team.total_players} Players</span>
            </div>
          </div>
        </div>

        {/* Basic Stats Box */}
        <div className="flex gap-4 font-mono text-xs">
          <div className="px-4 py-2 border border-slate-200 bg-slate-50 text-center">
            <div className="text-lg font-bold text-slate-900">{fmt(team.stats.offensiveRating)}</div>
            <div className="text-[9px] text-slate-500 uppercase mt-0.5 tracking-wider">OFF RTG</div>
          </div>
          <div className="px-4 py-2 border border-slate-200 bg-slate-50 text-center">
            <div className="text-lg font-bold text-slate-900">{fmt(team.stats.defensiveRating)}</div>
            <div className="text-[9px] text-slate-500 uppercase mt-0.5 tracking-wider">DEF RTG</div>
          </div>
        </div>
      </section>

      {/* ─── CHARTS & INSIGHTS ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Composition Chart */}
        <div className="lg:col-span-7 border border-slate-200 bg-white/50 p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900 uppercase tracking-wider">Archetypes Composition</h3>
            <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mt-1">Percentage distribution of player tactical types in the roster</p>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legends */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 flex-shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="text-slate-700 font-mono tracking-wide uppercase text-[10px]">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis Box */}
        <div className="lg:col-span-5 border border-slate-200 p-6 md:p-8 flex flex-col justify-between bg-brand-50">
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-brand-500 uppercase tracking-widest block font-semibold">
              ROSTER INTELLIGENCE REPORT
            </span>
            <p className="text-sm text-slate-700 leading-relaxed font-sans border-l-2 border-brand-500 pl-4 py-1">
              {aiInsight}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-200 text-[9px] font-mono text-slate-500 mt-6 uppercase tracking-wider">
            This analysis is concluded exclusively using the weighted representation of the {team.team} roster archetypes.
          </div>
        </div>
      </div>

      {/* ─── ROSTER TABLE ────────────────────────────────────────── */}
      <section className="border border-slate-200 p-6 md:p-8 space-y-6 bg-white/50">
        <div>
          <h3 className="text-lg font-display font-bold text-slate-900 uppercase tracking-wider">Roster Directory</h3>
          <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mt-1">Average per-game performance statistics of the active roster</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left divide-y divide-slate-200">
            <thead className="text-[9px] text-slate-500 uppercase font-mono tracking-widest">
              <tr>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-2">Position</th>
                <th className="py-3 px-2">Archetype</th>
                <th className="py-3 px-2 text-right">PTS</th>
                <th className="py-3 px-2 text-right">AST</th>
                <th className="py-3 px-2 text-right">REB</th>
                <th className="py-3 px-2 text-right">MIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {team.roster.map((p) => (
                <tr key={p.personId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-display font-bold text-sm text-slate-900">
                    <Link to={`/player/${p.personId}`} className="hover:text-brand-500 transition-colors">
                      {p.fullName.toUpperCase()}
                    </Link>
                  </td>
                  <td className="py-3.5 px-2 text-slate-500 font-mono">{p.position}</td>
                  <td className="py-3.5 px-2">
                    <span
                      className="text-[9px] font-mono font-semibold px-2 py-0.5 border"
                      style={{ borderColor: `${p.cluster_color}40`, color: p.cluster_color }}
                    >
                      {p.cluster_name.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono">{fmt(p.pts)}</td>
                  <td className="py-3.5 px-2 text-right font-mono">{fmt(p.ast)}</td>
                  <td className="py-3.5 px-2 text-right font-mono">{fmt(p.reb)}</td>
                  <td className="py-3.5 px-2 text-right font-mono">{fmt(p.numMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
