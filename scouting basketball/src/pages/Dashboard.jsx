import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, User, ArrowRight } from 'lucide-react';
import { getMeta, getClusters, getTeams, searchPlayers, getPlayers, fmt, fmtPct } from '../utils/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Dashboard() {
  const meta = getMeta();
  const clusters = getClusters();
  const teams = getTeams();
  const players = getPlayers();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAllTeams, setShowAllTeams] = useState(false);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length >= 2) {
      setSearchResults(searchPlayers(val));
    } else {
      setSearchResults([]);
    }
  };

  const clusterChartData = clusters.map(c => ({
    name: c.name,
    count: c.count,
    color: c.color
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="space-y-0">
      
      {/* ─── NEW HERO SECTION (Sport Cover Style Split Layout) ─── */}
      <section className="h-screen w-full grid grid-cols-1 md:grid-cols-2 relative border-b border-slate-200">
        
        {/* Left Column: Full-Bleed Video */}
        <div className="relative w-full h-full border-r border-slate-200/50 hidden md:block">
          <video 
            src="/YTDown.com_YouTube_2025-NBA-Tip-Off-START-TO-FINISH_Media_GEohF0W80Kg_002_720p.mp4" 
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Column: Search & Action (Light Theme Blur) */}
        <div className="relative w-full h-full bg-white flex flex-col justify-center px-8 md:px-16 overflow-hidden">
          
          {/* Subtle ambient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-white opacity-60 pointer-events-none"></div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative z-10 w-full max-w-lg mx-auto md:mx-0 space-y-8"
          >
            <div className="space-y-4">
              <h2 className="font-display font-extrabold text-5xl md:text-7xl text-slate-900 leading-[0.9] uppercase tracking-tight">
                Scout Your <br/>
                <span className="text-brand-500">Next Star.</span>
              </h2>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.2em]">
                Discover Your Future Stars Through Intelligent Analytics
              </p>
            </div>

            {/* Interactive Search Field */}
            <div className="w-full relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
              <input
                type="text"
                placeholder="Search player profiles..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-slate-50/50 backdrop-blur-xl border border-slate-200 rounded-xl px-6 py-4 pl-14 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 font-mono transition-all shadow-sm"
              />

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 divide-y divide-slate-100 max-h-[40vh] overflow-y-auto custom-scrollbar text-left"
                >
                  {searchResults.map((p) => (
                    <button
                      key={p.personId}
                      onClick={() => navigate(`/player/${p.personId}`)}
                      className="w-full text-left px-5 py-4 hover:bg-slate-50 flex items-center justify-between transition-colors duration-150"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-full text-slate-500">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-900">{p.fullName}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5 uppercase">{p.team} • {p.position}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[9px] font-mono px-2 py-1 rounded-full font-semibold border"
                          style={{ borderColor: `${p.cluster_color}40`, color: p.cluster_color }}
                        >
                          {p.cluster_name.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* SCROLL Indicator at bottom right */}
          <div className="absolute bottom-0 right-0 bg-white border-t border-l border-slate-200 px-8 py-6 flex items-center gap-4 shadow-sm z-20">
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.3em] text-slate-900">Scroll</span>
            <div className="w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LEAGUE OVERVIEW NUMBERS (Animated Scroll) ─── */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-4 border-b border-slate-200 divide-x divide-slate-200 max-w-7xl mx-auto"
      >
        {[
          { label: 'Total Players Aggregated', val: meta.total_players },
          { label: 'NBA Active Teams Map', val: meta.total_teams },
          { label: 'Scouting Archetypes Map', val: meta.total_clusters },
          { label: 'League Average PPG', val: fmt(meta.avg_pts) },
        ].map((c, i) => (
          <motion.div key={i} variants={itemVariants} className="p-8 space-y-2">
            <div className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 tracking-tight tabular-nums">
              {c.val}
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.15em]">
              {c.label}
            </div>
          </motion.div>
        ))}
      </motion.section>


      {/* ─── CHARTS & TEAM DIRECTORY GRID ──────────────────────────── */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto px-4 md:px-0 py-24"
      >
        
        {/* Cluster Distribution Visualizer */}
        <motion.div variants={itemVariants} className="lg:col-span-7 border border-slate-200 p-6 md:p-8 space-y-8 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900 tracking-tight uppercase">Cluster Distribution</h3>
            <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mt-1">Demographic map of league playstyle classifications</p>
          </div>
          <div className="chart-container h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clusterChartData} margin={{ left: -20, right: 0, top: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={8} fontClassName="font-mono" tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis stroke="#64748b" fontSize={9} fontClassName="font-mono" tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }} 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0px', fontFamily: 'monospace', fontSize: '10px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '4px' }}
                  itemStyle={{ color: '#f97316' }}
                />
                <Bar dataKey="count" fill="#f97316" radius={0} barSize={32}>
                  {clusterChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Team Power Index */}
        <motion.div variants={itemVariants} className="lg:col-span-5 border border-slate-200 p-6 md:p-8 space-y-6 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all flex flex-col h-full">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900 tracking-tight uppercase">League Efficiency</h3>
            <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mt-1">Ratio of team offensive and defensive efficiency</p>
          </div>
          
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-xs text-left divide-y divide-slate-200">
              <thead className="text-[9px] text-slate-500 uppercase font-mono tracking-widest">
                <tr>
                  <th className="py-3 px-1 font-semibold">Team Name</th>
                  <th className="py-3 px-1 text-right font-semibold">Off Rtg</th>
                  <th className="py-3 px-1 text-right font-semibold">Def Rtg</th>
                  <th className="py-3 px-1 text-right font-semibold">Net Rtg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {(showAllTeams ? teams : teams.slice(0, 6)).map((t, idx) => {
                  const net = t.stats.offensiveRating - t.stats.defensiveRating;
                  return (
                    <tr key={idx} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/team/${t.team}`)}>
                      <td className="py-4 px-1 font-display font-bold text-sm text-slate-900 group-hover:text-brand-500 transition-colors">
                        {t.team.toUpperCase()}
                      </td>
                      <td className="py-4 px-1 text-right">{fmt(t.stats.offensiveRating)}</td>
                      <td className="py-4 px-1 text-right">{fmt(t.stats.defensiveRating)}</td>
                      <td className={`py-4 px-1 text-right font-bold ${net >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {net >= 0 ? '+' : ''}{fmt(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="text-center pt-6 border-t border-slate-200 space-y-3">
            <button 
              onClick={() => setShowAllTeams(!showAllTeams)}
              className="inline-flex items-center justify-center w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-bold tracking-widest uppercase transition-colors border border-slate-200"
            >
              {showAllTeams ? 'Show Less' : 'View All Teams'}
            </button>
            <Link to="/compare" className="inline-flex items-center justify-center w-full py-4 bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 border border-brand-500/20 shadow-sm">
              SIMULATE TACTICAL HEAD-TO-HEAD
            </Link>
          </div>
        </motion.div>
      </motion.section>

      {/* ─── CLUSTERS INDEX DIRECTORY ────────────────────────────── */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="space-y-8 max-w-7xl mx-auto px-4 md:px-0 pb-24"
      >
        <motion.div variants={itemVariants} className="text-center md:text-left border-b border-slate-200 pb-6">
          <h3 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight uppercase">Scout Archetypes Directory</h3>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mt-2">Classification of player archetypes based on ML profile similarity</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clusters.map((c) => (
            <motion.div 
              key={c.cluster_id} 
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group border border-slate-200 bg-white shadow-sm rounded-none transition-all duration-300 flex flex-col hover:border-slate-300 hover:shadow-md"
            >
              <Link 
                to={`/cluster/${c.cluster_id}`}
                className="w-full text-left p-8 space-y-5 flex flex-col justify-between h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color, boxShadow: `0 0 10px ${c.color}` }}></span>
                      <h4 className="font-display font-extrabold text-lg text-slate-900 uppercase tracking-wider">{c.name}</h4>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-500" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans group-hover:text-slate-700 transition-colors">
                    {c.desc}
                  </p>
                </div>
                <div className="pt-5 border-t border-white/5 flex items-center justify-between w-full text-[10px] font-mono text-slate-500 font-semibold group-hover:text-slate-400 transition-colors">
                  <span>POPULATION: {c.count} PLAYERS</span>
                  <span>USG: {fmtPct(c.avg_stats.usg)}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
