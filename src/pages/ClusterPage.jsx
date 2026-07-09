import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCluster, getPlayers, fmt, fmtPct } from '../utils/data';
import { ArrowLeft, ArrowUpDown, ChevronDown, ChevronUp, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClusterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cluster = getCluster(id);
  const allPlayers = getPlayers();
  
  const [sortConfig, setSortConfig] = useState({ key: 'points', direction: 'desc' });

  if (!cluster) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white font-mono">
        Cluster not found.
      </div>
    );
  }

  const clusterPlayers = allPlayers.filter(p => p.cluster_id === cluster.cluster_id);

  const sortedPlayers = useMemo(() => {
    let sortableItems = [...clusterPlayers];
    sortableItems.sort((a, b) => {
      let aVal = a.stats[sortConfig.key] ?? 0;
      let bVal = b.stats[sortConfig.key] ?? 0;
      
      if (sortConfig.key === 'fullName') {
        aVal = a.fullName?.toLowerCase() || '';
        bVal = b.fullName?.toLowerCase() || '';
      }

      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [clusterPlayers, sortConfig]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'desc' 
      ? <ChevronDown className="w-3 h-3 text-brand-500" />
      : <ChevronUp className="w-3 h-3 text-brand-500" />;
  };

  const thClass = "py-4 px-3 text-left font-semibold cursor-pointer hover:bg-slate-100 transition-colors group select-none";

  return (
    <div className="pt-16 pb-20 max-w-7xl mx-auto px-4 md:px-0 space-y-8">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-4">
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cluster.color, boxShadow: `0 0 15px ${cluster.color}` }}></span>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-slate-900 uppercase tracking-tight">
            {cluster.name}
          </h1>
        </div>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed font-sans">
          {cluster.desc}
        </p>

        <div className="flex gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total Population</div>
            <div className="text-xl font-mono text-slate-900 font-bold">{cluster.count} Players</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Average Usage</div>
            <div className="text-xl font-mono text-slate-900 font-bold">{fmtPct(cluster.avg_stats.usg)}</div>
          </div>
        </div>
      </motion.div>

      {/* Players Table */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="border border-slate-200 bg-white/80 backdrop-blur-sm overflow-hidden shadow-sm rounded-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[9px] text-slate-500 uppercase font-mono tracking-widest bg-slate-50 border-b border-slate-200">
              <tr>
                <th className={thClass} onClick={() => requestSort('fullName')}>
                  <div className="flex items-center gap-2">Player <SortIcon columnKey="fullName" /></div>
                </th>
                <th className="py-4 px-3 font-semibold">Team</th>
                <th className={thClass} onClick={() => requestSort('numMinutes')}>
                  <div className="flex items-center gap-2">MPG <SortIcon columnKey="numMinutes" /></div>
                </th>
                <th className={thClass} onClick={() => requestSort('points')}>
                  <div className="flex items-center gap-2">PPG <SortIcon columnKey="points" /></div>
                </th>
                <th className={thClass} onClick={() => requestSort('assists')}>
                  <div className="flex items-center gap-2">APG <SortIcon columnKey="assists" /></div>
                </th>
                <th className={thClass} onClick={() => requestSort('reboundsTotal')}>
                  <div className="flex items-center gap-2">RPG <SortIcon columnKey="reboundsTotal" /></div>
                </th>
                <th className={thClass} onClick={() => requestSort('trueShootingPercentage')}>
                  <div className="flex items-center gap-2">TS% <SortIcon columnKey="trueShootingPercentage" /></div>
                </th>
                <th className={thClass} onClick={() => requestSort('usagePercentage')}>
                  <div className="flex items-center gap-2">USG% <SortIcon columnKey="usagePercentage" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
              {sortedPlayers.map((p, idx) => (
                <tr 
                  key={`${p.personId}-${idx}`} 
                  className="group hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/player/${p.personId}`)}
                >
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:border-brand-500/50 transition-colors overflow-hidden shrink-0">
                        <img 
                          src={`https://cdn.nba.com/headshots/nba/latest/260x190/${p.personId}.png`}
                          alt={p.fullName}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://cdn.nba.com/headshots/nba/latest/260x190/fallback.png";
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-display font-bold text-sm text-slate-900 group-hover:text-brand-500 transition-colors">
                          {p.fullName}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase mt-0.5">{p.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 font-bold text-slate-800">{p.team}</td>
                  <td className="py-4 px-3">{fmt(p.stats.numMinutes)}</td>
                  <td className="py-4 px-3 text-slate-900 font-bold">{fmt(p.stats.points)}</td>
                  <td className="py-4 px-3">{fmt(p.stats.assists)}</td>
                  <td className="py-4 px-3">{fmt(p.stats.reboundsTotal)}</td>
                  <td className="py-4 px-3">{fmtPct(p.stats.trueShootingPercentage)}</td>
                  <td className="py-4 px-3">{fmtPct(p.stats.usagePercentage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}
