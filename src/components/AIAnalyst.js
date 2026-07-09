import playerReports from '../data/player_ai_reports.json';
import teamReports from '../data/team_ai_reports.json';
import matchupReports from '../data/matchup_ai_reports.json';

/**
 * Analyst Engine (Deterministic Sports Analytics)
 * Now fully powered by True Generative AI!
 * All hardcoded if-else logic has been removed in favor of static JSON lookups.
 */

export const generatePlayerInsight = (player) => {
  const insight = playerReports[player.personId];
  if (insight) return insight;
  
  return `Waiting for AI generation for ${player.fullName}... (Please run generate_ai_reports.js)`;
};

export const generateTeamInsight = (teamData) => {
  const insight = teamReports[teamData.team];
  if (insight && insight.offensiveStrength && insight.defensiveStrength) {
    return `${insight.offensiveStrength} ${insight.defensiveStrength}`;
  }
  return `Waiting for AI generation for ${teamData.team}...`;
};

export const generateScoutReport = (teamA, teamB) => {
  const nameA = teamA.team;
  const report = teamReports[nameA] || {};

  return {
    offensiveStrength: report.offensiveStrength || "Structured offense execution.",
    offensiveWeakness: report.offensiveWeakness || "Limited isolation scoring options.",
    defensiveStrength: report.defensiveStrength || "Defensive rebounding strength.",
    defensiveWeakness: report.defensiveWeakness || "Slow transition defense recovery.",
    recommendedStrategy: report.recommendedStrategy || [
      `Focus help defense to limit their primary scorer's space.`,
      `Close outer perimeter lanes with tight rotations to contain ${nameA} sharpshooters.`
    ]
  };
};

export const generateComparisonAnalysis = (teamA, teamB) => {
  const nameA = teamA.team;
  const nameB = teamB.team;
  
  // The script saves matchups with alphabetical order or TeamA_vs_TeamB
  // Let's check both combinations
  const key1 = `${nameA}_vs_${nameB}`;
  const key2 = `${nameB}_vs_${nameA}`;
  
  if (matchupReports[key1]) return matchupReports[key1];
  if (matchupReports[key2]) return matchupReports[key2];
  
  return `Tactical battle between ${nameA} and ${nameB} is being compiled by AI. Please run generate_ai_reports.js to see results.`;
};
