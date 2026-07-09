import nbaData from '../data/nba_processed_data.json'

// ── Lookup helpers ───────────────────────────────────────────────
const playerMap  = Object.fromEntries(nbaData.players.map(p => [p.personId, p]))
const teamMap    = Object.fromEntries(nbaData.teams.map(t => [t.team, t]))
const clusterMap = Object.fromEntries(nbaData.clusters.map(c => [c.cluster_id, c]))

// ── Exports ──────────────────────────────────────────────────────
export const getMeta      = () => nbaData.meta
export const getClusters  = () => nbaData.clusters
export const getPlayers   = () => nbaData.players
export const getTeams     = () => nbaData.teams

export const getPlayer    = (id)   => playerMap[String(id)]
export const getTeam      = (name) => teamMap[name]
export const getCluster   = (id)   => clusterMap[id]

export const searchPlayers = (query) => {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return nbaData.players
    .filter(p => p.fullName.toLowerCase().includes(q) || p.team.toLowerCase().includes(q))
    .slice(0, 10)
}

export const searchTeams = (query) => {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return nbaData.teams.filter(t => t.team.toLowerCase().includes(q))
}

// ── Formatting helpers ───────────────────────────────────────────
export const fmt = (val, decimals = 1) => {
  if (val === null || val === undefined || isNaN(val)) return '—'
  return Number(val).toFixed(decimals)
}

export const fmtPct = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '—'
  const v = Number(val)
  return v <= 1 ? (v * 100).toFixed(1) + '%' : v.toFixed(1) + '%'
}

export const CLUSTER_COLORS = {
  'Pure 3PT Shooter':     '#f97316',
  'Two-Way Energy Wing':  '#22c55e',
  'Interior Anchor':      '#ef4444',
  'Secondary Playmaker':  '#3b82f6',
  'Stretch Big':          '#06b6d4',
  'Franchise Cornerstone':'#f59e0b',
  'Volume Wing Scorer':   '#8b5cf6',
}

export const POSITION_MAP = {
  'G':  'Guard',
  'F':  'Forward',
  'C':  'Center',
  'G-F':'Guard-Forward',
  'F-G':'Forward-Guard',
  'F-C':'Forward-Center',
  'C-F':'Center-Forward',
  'N/A':'N/A',
}

export const getTeamLogoUrl = (teamName) => {
  const map = {
    '76ers': 'phi', 'bucks': 'mil', 'bulls': 'chi', 'cavaliers': 'cle',
    'celtics': 'bos', 'clippers': 'lac', 'grizzlies': 'mem', 'hawks': 'atl',
    'heat': 'mia', 'hornets': 'cha', 'jazz': 'uta', 'kings': 'sac',
    'knicks': 'ny', 'lakers': 'lal', 'magic': 'orl', 'mavericks': 'dal',
    'nets': 'bkn', 'nuggets': 'den', 'pacers': 'ind', 'pelicans': 'no',
    'pistons': 'det', 'raptors': 'tor', 'rockets': 'hou', 'spurs': 'sas',
    'suns': 'phx', 'thunder': 'okc', 'timberwolves': 'min', 'trail blazers': 'por',
    'warriors': 'gs', 'wizards': 'was'
  };
  const key = teamName.toLowerCase().trim();
  const abbr = map[key] || 'nba';
  return `https://a.espncdn.com/i/teamlogos/nba/500/${abbr}.png`;
};
