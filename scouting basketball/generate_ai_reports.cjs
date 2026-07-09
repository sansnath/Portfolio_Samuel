const fs = require('fs');

const dataRaw = fs.readFileSync('src/data/nba_processed_data.json', 'utf8');
const data = JSON.parse(dataRaw);

const players = Object.values(data.players || {});
const teams = [...new Set(players.map(p => p.team))].filter(Boolean);

// Calculate league averages for comparison
const teamStats = {};
teams.forEach(t => {
  const tPlayers = players.filter(p => p.team === t);
  const ppg = tPlayers.reduce((sum, p) => sum + (p.stats.points || 0), 0);
  const rpg = tPlayers.reduce((sum, p) => sum + (p.stats.reboundsTotal || 0), 0);
  const apg = tPlayers.reduce((sum, p) => sum + (p.stats.assists || 0), 0);
  const tpa = tPlayers.reduce((sum, p) => sum + (p.stats.threePointersAttempted || 0), 0);
  
  const clusters = {};
  tPlayers.forEach(p => {
    clusters[p.cluster_name] = (clusters[p.cluster_name] || 0) + 1;
  });

  // Find top scorer
  tPlayers.sort((a,b) => (b.stats.points || 0) - (a.stats.points || 0));
  const topScorer = tPlayers[0] ? tPlayers[0].lastName : 'pemain andalan';

  teamStats[t] = { ppg, rpg, apg, tpa, clusters, topScorer, players: tPlayers };
});

const leagueAvgPPG = Object.values(teamStats).reduce((sum, t) => sum + t.ppg, 0) / teams.length;
const leagueAvgRPG = Object.values(teamStats).reduce((sum, t) => sum + t.rpg, 0) / teams.length;
const leagueAvgTPA = Object.values(teamStats).reduce((sum, t) => sum + t.tpa, 0) / teams.length;

const reports = {};

teams.forEach(t => {
  const stat = teamStats[t];
  const c = stat.clusters;
  
  const superStars = c['Franchise Cornerstone'] || 0;
  const shooters = c['Pure 3PT Shooter'] || 0;
  const anchors = c['Interior Anchor'] || 0;
  const playmakers = c['Secondary Playmaker'] || 0;
  const stretchBigs = c['Stretch Big'] || 0;
  const energy = c['Two-Way Energy Wing'] || 0;

  // OFFENSIVE STRENGTH
  let offStr = "";
  if (superStars > 0) {
    offStr = `Serangan elit yang berpusat pada dominasi isolasi dan playmaking dari ${stat.topScorer}. `;
  } else if (playmakers >= 2) {
    offStr = `Sirkulasi bola kolektif yang sangat cair karena digerakkan oleh ${playmakers} playmaker sekunder secara bersamaan. `;
  } else {
    offStr = `Distribusi penguasaan bola teratur dengan pembagian beban skor yang merata. `;
  }

  if (stat.tpa > leagueAvgTPA && shooters > 0) {
    offStr += `Kerapatan ancaman tembakan tiga angka yang sangat mematikan berkat kehadiran ${shooters} spesialis perimeter, memaksa pertahanan lawan merenggang.`;
  } else if (stretchBigs > 0) {
    offStr += `Spacing yang sangat baik karena didukung oleh Stretch Big yang mampu menarik bek tinggi keluar dari area paint.`;
  } else {
    offStr += `Fokus pada eksekusi efisien di area dalam dan menengah.`;
  }

  // OFFENSIVE WEAKNESS
  let offWeak = "";
  if (superStars === 0) {
    offWeak = `Sering mengalami kebuntuan (stagnasi) di kuarter keempat karena tidak memiliki pemain bintang murni yang bisa mencetak poin secara mandiri dalam situasi krusial. `;
  } else if (playmakers === 0) {
    offWeak = `Sangat rentan terhadap jebakan (trap) karena kurangnya pengatur serangan sekunder saat ${stat.topScorer} dimatikan. `;
  } else {
    offWeak = `Terkadang terlalu bergantung pada ritme tembakan perimeter, rentan mengalami paceklik skor jika sedang meleset. `;
  }
  
  if (stat.tpa < leagueAvgTPA) {
    offWeak += `Volume percobaan tiga angka yang berada di bawah rata-rata liga membuat mereka kesulitan mengejar defisit poin dengan cepat.`;
  }

  // DEFENSIVE STRENGTH
  let defStr = "";
  if (anchors > 0) {
    defStr = `Proteksi ring yang sangat kokoh dan dominasi rebound defensif berkat keberadaan Interior Anchor murni. Lawan akan kesulitan mencetak poin dari tusukan penetrasi. `;
  } else if (energy >= 2) {
    defStr = `Intensitas pertahanan perimeter yang mengerikan dengan kehadiran ${energy} pemain sayap (3&D) yang agresif memutus jalur operan. `;
  } else {
    defStr = `Sistem pertahanan kolektif yang mengandalkan rotasi cepat dan komunikasi antar pemain. `;
  }

  if (stat.rpg > leagueAvgRPG) {
    defStr += `Keunggulan postur tubuh memastikan lawan jarang mendapatkan kesempatan rebound offensif (second-chance points).`;
  }

  // DEFENSIVE WEAKNESS
  let defWeak = "";
  if (anchors === 0) {
    defWeak = `Sangat rentan hancur di area cat (paint area) akibat absennya pelindung ring murni. Lawan bisa dengan mudah mengeksploitasi pertarungan fisik di bawah ring. `;
  } else if (energy === 0) {
    defWeak = `Kekurangan bek perimeter lincah membuat mereka sering terlambat menutup (close-out) penembak jitu lawan, membiarkan banyak tembakan 3PT terbuka. `;
  } else {
    defWeak = `Kerap kali kesulitan menghentikan serangan balik cepat (fast break transisi) lawan setelah turnover. `;
  }

  // RECOMMENDED STRATEGY
  const strategies = [];
  if (superStars > 0) {
    strategies.push(`Terapkan skema double-team atau blitz terhadap ${stat.topScorer} untuk memaksanya melepaskan bola ke pemain role-player.`);
  } else {
    strategies.push(`Gunakan pertahanan man-to-man ketat, mereka tidak memiliki isolator dominan yang bisa menghukum pertahanan 1-lawan-1.`);
  }

  if (shooters > 0) {
    strategies.push(`Jangan berikan jarak satu jengkal pun di garis tiga angka (run them off the line); paksa penembak mereka untuk melakukan dribble drive.`);
  } else {
    strategies.push(`Padatkan area paint (pack the paint) dan pancing mereka untuk membuktikan diri lewat tembakan dari luar garis perimeter.`);
  }

  if (anchors > 0) {
    strategies.push(`Gunakan skema pick-and-pop di area luar atau mainkan Stretch Big untuk memancing pelindung ring raksasa mereka keluar dari sarangnya.`);
  } else {
    strategies.push(`Instruksikan guard untuk terus melakukan penetrasi tajam (drive) ke arah ring dan mencari pelanggaran, mengeksploitasi ketiadaan blocker murni mereka.`);
  }

  reports[t] = {
    offensiveStrength: offStr.trim(),
    offensiveWeakness: offWeak.trim(),
    defensiveStrength: defStr.trim(),
    defensiveWeakness: defWeak.trim(),
    recommendedStrategy: strategies
  };
});

fs.writeFileSync('src/data/team_ai_reports.json', JSON.stringify(reports, null, 2));
console.log('Successfully generated team_ai_reports.json for ' + teams.length + ' teams!');
