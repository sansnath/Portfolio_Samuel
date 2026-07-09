import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTeams, fmt, getTeamLogoUrl } from '../utils/data';
import { generateComparisonAnalysis, generateScoutReport } from '../components/AIAnalyst';
import { ArrowRight, User } from 'lucide-react';

export default function TeamComparison() {
  const teams = getTeams();
  
  const [teamAName, setTeamAName] = useState(teams[0]?.team || '');
  const [teamBName, setTeamBName] = useState(teams[1]?.team || '');

  const teamA = teams.find(t => t.team === teamAName);
  const teamB = teams.find(t => t.team === teamBName);

  const tacticalAnalysis = teamA && teamB ? generateComparisonAnalysis(teamA, teamB) : '';
  
  // Scouting reports generated separately for each team
  const scoutReportA = teamA && teamB ? generateScoutReport(teamA, teamB) : null;
  const scoutReportB = teamB && teamA ? generateScoutReport(teamB, teamA) : null;

  const clusterNames = [
    'Franchise Cornerstone',
    'Pure 3PT Shooter',
    'Interior Anchor',
    'Secondary Playmaker',
    'Stretch Big',
    'Bench Rotation Piece',
    'Two-Way Energy Wing'
  ];

  // Helper function to extract the best starting lineup (highest minutes played per standard position G, F, C)
  const getOptimalLineup = (roster) => {
    if (!roster) return [];
    
    // Sort by minutes played descending
    const sorted = [...roster].sort((a, b) => b.numMinutes - a.numMinutes);
    
    const guards = sorted.filter(p => p.position.includes('G')).slice(0, 2);
    const forwards = sorted.filter(p => p.position.includes('F')).slice(0, 2);
    const centers = sorted.filter(p => p.position.includes('C')).slice(0, 1);
    
    // Fallback if positional data is incomplete
    const lineup = [...guards, ...forwards, ...centers];
    if (lineup.length < 5) {
      return sorted.slice(0, 5);
    }
    return lineup.slice(0, 5);
  };

  const lineupA = getOptimalLineup(teamA?.roster);
  const lineupB = getOptimalLineup(teamB?.roster);

  return (
    <div className="pt-16 pb-20 space-y-16 max-w-6xl mx-auto px-4 md:px-0">
      
      {/* ─── TITLE HEADLINE ───────────────────────────────────────── */}
      <div className="text-center space-y-4 pt-12">
        <span className="text-[10px] font-mono tracking-[0.2em] text-brand-500 uppercase font-semibold block">
          TACTICAL H2H SIMULATOR
        </span>
        <h2 className="font-display font-extrabold text-4xl md:text-6xl text-slate-900 tracking-tight uppercase leading-none">
          TEAM MATCHUP <span className="text-gradient-gold">ANALYSIS</span>
        </h2>
        <div className="w-12 h-0.5 bg-brand-500 mx-auto mt-4"></div>
      </div>

      {/* ─── TEAM SELECTORS ───────────────────────────────────────── */}
      <section className="border border-slate-200 bg-white shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-8 vs-split relative">
        {/* Team A Selection */}
        <div className="w-full md:w-[42%] space-y-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-none p-1.5 flex-shrink-0 flex items-center justify-center shadow-sm">
               <img src={getTeamLogoUrl(teamAName)} alt={teamAName} className="w-full h-full object-contain" />
            </div>
            <div className="flex-grow space-y-2">
              <span className="text-[9px] font-mono text-brand-500 uppercase tracking-[0.25em] block">HOME UNIT</span>
              <select
                value={teamAName}
                onChange={(e) => setTeamAName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-none px-4 py-3.5 text-slate-900 font-display font-extrabold text-xl focus:outline-none focus:border-brand-500 transition-all cursor-pointer uppercase tracking-wide"
              >
                {teams.map(t => (
                  <option key={t.team} value={t.team}>{t.team.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
          {teamA && (
            <div className="flex justify-start gap-8 font-mono text-xs pl-20">
              <div>
                <div className="text-slate-500 tracking-wider">OFF RTG</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{fmt(teamA.stats.offensiveRating)}</div>
              </div>
              <div className="border-l border-slate-200 pl-8">
                <div className="text-slate-500 tracking-wider">DEF RTG</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{fmt(teamA.stats.defensiveRating)}</div>
              </div>
            </div>
          )}
        </div>

        {/* VS Spacer */}
        <div className="h-12 md:h-0"></div>

        {/* Team B Selection */}
        <div className="w-full md:w-[42%] space-y-6">
          <div className="flex items-center gap-4 text-right justify-end">
            <div className="flex-grow space-y-2">
              <span className="text-[9px] font-mono text-blue-500 uppercase tracking-[0.25em] block">AWAY UNIT</span>
              <select
                value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-none px-4 py-3.5 text-slate-900 font-display font-extrabold text-xl focus:outline-none focus:border-blue-500 transition-all cursor-pointer text-right uppercase tracking-wide"
              >
                {teams.map(t => (
                  <option key={t.team} value={t.team} disabled={t.team === teamAName}>{t.team.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-none p-1.5 flex-shrink-0 flex items-center justify-center shadow-sm">
               <img src={getTeamLogoUrl(teamBName)} alt={teamBName} className="w-full h-full object-contain" />
            </div>
          </div>
          {teamB && (
            <div className="flex justify-end gap-8 font-mono text-xs pr-20">
              <div className="border-r border-slate-200 pr-8">
                <div className="text-slate-500 tracking-wider">OFF RTG</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{fmt(teamB.stats.offensiveRating)}</div>
              </div>
              <div>
                <div className="text-slate-500 tracking-wider">DEF RTG</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{fmt(teamB.stats.defensiveRating)}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {teamA && teamB && (
        <>
          {/* ─── OPTIMAL PROJECTED STARTING LINEUPS ──────────────────── */}
          <section className="border border-slate-200 p-6 md:p-8 space-y-6 bg-white/50">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900 uppercase tracking-wider">Projected Best Lineups</h3>
              <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mt-1">Estimated starting lineup based on highest average minutes played per position</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              
              {/* Lineup A */}
              <div className="space-y-4 pr-0 md:pr-4">
                <span className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block font-semibold">
                  {teamA.team.toUpperCase()} LINEUP
                </span>
                <div className="space-y-2">
                  {lineupA.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 bg-slate-50 font-mono text-xs shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-brand-500 font-bold w-4">{p.position}</span>
                        <Link to={`/player/${p.personId}`} className="hover:text-brand-500 font-semibold font-display text-slate-900 transition-colors">
                          {p.fullName.toUpperCase()}
                        </Link>
                      </div>
                      <span className="text-[10px] text-slate-500">{p.cluster_name.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lineup B */}
              <div className="space-y-4 pt-6 md:pt-0 pl-0 md:pl-8">
                <span className="text-[10px] font-mono text-blue-500 uppercase tracking-wider block font-semibold">
                  {teamB.team.toUpperCase()} LINEUP
                </span>
                <div className="space-y-2">
                  {lineupB.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 bg-slate-50 font-mono text-xs shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-blue-500 font-bold w-4">{p.position}</span>
                        <Link to={`/player/${p.personId}`} className="hover:text-blue-500 font-semibold font-display text-slate-900 transition-colors">
                          {p.fullName.toUpperCase()}
                        </Link>
                      </div>
                      <span className="text-[10px] text-slate-500">{p.cluster_name.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* ─── STATISTICAL HEAD-TO-HEAD BATTLE ARENA ─────────────── */}
          <section className="border border-slate-200 p-6 md:p-8 space-y-6 bg-white/50">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900 uppercase tracking-wider">Matchup Metrics</h3>
              <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mt-1">Comparison of team statistical performance this season</p>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Offensive Rating', valA: teamA.stats.offensiveRating, valB: teamB.stats.offensiveRating, better: 'higher' },
                { label: 'Defensive Rating', valA: teamA.stats.defensiveRating, valB: teamB.stats.defensiveRating, better: 'lower' },
                { label: 'Points Per Game', valA: teamA.stats.points, valB: teamB.stats.points, better: 'higher' },
                { label: 'Assists Per Game', valA: teamA.stats.assists, valB: teamB.stats.assists, better: 'higher' },
                { label: 'Rebounds Per Game', valA: teamA.stats.reboundsTotal, valB: teamB.stats.reboundsTotal, better: 'higher' },
              ].map((s, i) => {
                const total = s.valA + s.valB || 1;
                const pctA = (s.valA / total) * 100;
                const pctB = (s.valB / total) * 100;
                const isBetterA = s.better === 'higher' ? s.valA > s.valB : s.valA < s.valB;

                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className={isBetterA ? 'text-brand-500 font-bold' : 'text-slate-500'}>
                        {teamA.team} ({fmt(s.valA)})
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</span>
                      <span className={!isBetterA ? 'text-blue-500 font-bold' : 'text-slate-500'}>
                        ({fmt(s.valB)}) {teamB.team}
                      </span>
                    </div>

                    <div className="h-1.5 w-full rounded-none bg-slate-100 overflow-hidden flex">
                      <div
                        style={{ width: `${pctA}%` }}
                        className={`h-full transition-all duration-500 ${isBetterA ? 'matchup-bar-fill-left' : 'bg-brand-500/20'}`}
                      ></div>
                      <div
                        style={{ width: `${pctB}%` }}
                        className={`h-full transition-all duration-500 ${!isBetterA ? 'matchup-bar-fill-right' : 'bg-blue-500/20'}`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ─── CLUSTER DIVERSITY / ROSTER PROFILE COMPARISON ────── */}
          <section className="border border-slate-200 p-6 md:p-8 space-y-6 bg-white/50">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900 uppercase tracking-wider">Archetypes Comparison</h3>
              <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mt-1">Active players count comparison per playstyle archetype</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clusterNames.map((cName) => {
                const countA = teamA.cluster_composition[cName] || 0;
                const countB = teamB.cluster_composition[cName] || 0;
                const total = Math.max(countA + countB, 1);

                return (
                  <div key={cName} className="p-4 border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="font-display font-bold text-sm tracking-wider uppercase text-slate-900">{cName}</span>
                      <span className="font-mono text-xs">
                        {countA} vs {countB}
                      </span>
                    </div>

                    <div className="h-1 w-full rounded-none bg-slate-200 overflow-hidden flex">
                      <div
                        style={{ width: `${(countA / total) * 100}%` }}
                        className="bg-brand-500 h-full transition-all duration-300"
                      ></div>
                      <div
                        style={{ width: `${(countB / total) * 100}%` }}
                        className="bg-blue-500 h-full transition-all duration-300"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ─── TACTICAL SCOUTING ANALYSIS REPORT ─────────────────── */}
          <section className="border border-slate-200 p-6 md:p-8 space-y-8 bg-brand-50">
            <div className="space-y-2">
              <h3 className="text-lg font-display font-bold text-slate-900 uppercase tracking-wider">Tactical Matchup Summary</h3>
              <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mt-1">Tactical matchup analysis based on team roster profiles</p>
            </div>
            
            <p className="text-sm text-slate-700 leading-relaxed font-sans border-l-2 border-brand-500 pl-4 py-1" dangerouslySetInnerHTML={{ __html: tacticalAnalysis }} />
          </section>

          {/* ─── INDEPENDENT SCOUTING SHEETS FOR BOTH TEAMS ─────────── */}
          {scoutReportA && scoutReportB && (
            <section className="space-y-12">
              <div className="border-t border-slate-200 pt-12 text-center">
                <span className="text-[9px] font-mono tracking-[0.2em] text-brand-500 uppercase font-semibold">DETAILED SCOUTING SHEETS</span>
                <h3 className="text-2xl font-display font-extrabold text-slate-900 uppercase mt-2">INDIVIDUAL TEAM INTEL</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Team A Scouting Sheet */}
                <div className="border border-slate-200 p-6 md:p-8 space-y-6 bg-slate-50 shadow-sm">
                  <span className="text-[9px] font-mono text-brand-500 uppercase tracking-widest block font-bold">HOME REPORT</span>
                  <h4 className="text-xl font-display font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3">
                    {teamA.team}
                  </h4>
                  
                  <div className="space-y-4 text-xs leading-relaxed">
                    <div>
                      <div className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">Offensive Strengths</div>
                      <div className="text-slate-700 mt-1.5">{scoutReportA.offensiveStrength}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">Offensive Weaknesses</div>
                      <div className="text-slate-700 mt-1.5">{scoutReportA.offensiveWeakness}</div>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <div className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">Defensive Strengths</div>
                      <div className="text-slate-700 mt-1.5">{scoutReportA.defensiveStrength}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">Defensive Weaknesses</div>
                      <div className="text-slate-700 mt-1.5">{scoutReportA.defensiveWeakness}</div>
                    </div>
                    <div className="border-t border-brand-500/20 pt-4 bg-brand-50 p-3 border">
                      <div className="font-mono text-[9px] text-brand-500 uppercase tracking-wider font-bold">Tactical Action Checklist</div>
                      <ul className="list-disc pl-4 text-slate-700 mt-2 space-y-2">
                        {scoutReportA.recommendedStrategy.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Team B Scouting Sheet */}
                <div className="border border-slate-200 p-6 md:p-8 space-y-6 bg-slate-50 shadow-sm">
                  <span className="text-[9px] font-mono text-blue-500 uppercase tracking-widest block font-bold">AWAY REPORT</span>
                  <h4 className="text-xl font-display font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3">
                    {teamB.team}
                  </h4>
                  
                  <div className="space-y-4 text-xs leading-relaxed">
                    <div>
                      <div className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">Offensive Strengths</div>
                      <div className="text-slate-700 mt-1.5">{scoutReportB.offensiveStrength}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">Offensive Weaknesses</div>
                      <div className="text-slate-700 mt-1.5">{scoutReportB.offensiveWeakness}</div>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <div className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">Defensive Strengths</div>
                      <div className="text-slate-700 mt-1.5">{scoutReportB.defensiveStrength}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">Defensive Weaknesses</div>
                      <div className="text-slate-700 mt-1.5">{scoutReportB.defensiveWeakness}</div>
                    </div>
                    <div className="border-t border-blue-500/20 pt-4 bg-blue-50 p-3 border">
                      <div className="font-mono text-[9px] text-blue-500 uppercase tracking-wider font-bold">Tactical Action Checklist</div>
                      <ul className="list-disc pl-4 text-slate-700 mt-2 space-y-2">
                        {scoutReportB.recommendedStrategy.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
