const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'src', 'data');
const PROCESSED_DATA_PATH = path.join(DATA_DIR, 'nba_processed_data.json');
const PLAYER_REPORTS_PATH = path.join(DATA_DIR, 'player_ai_reports.json');
const MATCHUP_REPORTS_PATH = path.join(DATA_DIR, 'matchup_ai_reports.json');

const data = JSON.parse(fs.readFileSync(PROCESSED_DATA_PATH, 'utf-8'));
const players = Object.values(data.players);

// --- PLAYER GENERATOR ---
const playerReports = {};

const intro = [
  "{name} bertindak sebagai poros utama dalam sistem {team}.",
  "Kehadiran {name} di lapangan memberikan dimensi taktis yang krusial bagi {team}.",
  "Secara analitik, {name} adalah elemen yang tak tergantikan dalam rotasi {team}.",
  "Dengan menit bermain yang solid, {name} menyuntikkan energi vital ke dalam skema {team}.",
  "Dalam struktur permainan {team}, {name} memegang peranan spesifik yang sangat efektif."
];

const offense_superstar = [
  "Sebagai motor serangan utama, ia menyerap {usg}% Usage Rate dengan efisiensi mematikan. Kemampuannya mencetak {pts} poin sambil mengatur ritme ({ast} assist) memaksa pertahanan lawan melakukan double-team secara reguler.",
  "Gravitasi ofensifnya luar biasa. Dengan {pts} PPG dan True Shooting {ts}%, ia tidak hanya menghancurkan penjagaan satu-lawan-satu, tetapi juga membuka ruang tembak bagi rekan setimnya lewat visi {ast} APG."
];
const offense_shooter = [
  "Sebagai spesialis jarak jauh, ia terus berlari melewati screen untuk menciptakan separasi. Akurasi tembakannya (TS% {ts}%) meregangkan pertahanan lawan (spacing) hingga ke batas maksimal.",
  "Ancaman tembakan tiganya memaksa defender untuk terus menempel ketat, yang secara tidak langsung membuka jalur penetrasi (driving lanes) bagi para guard di tim."
];
const offense_anchor = [
  "Meski tidak dominan dalam penguasaan bola, ia adalah tembok kokoh di area cat. Kontribusi {reb} rebound per game memastikan {team} selalu memenangkan pertarungan di bawah ring.",
  "Fokus utamanya adalah menjadi jangkar pertahanan dan penyelesai lob di area dalam. Kemampuannya mengunci rebound ({reb} RPG) mencegah lawan mendapatkan kesempatan serangan kedua (second-chance points)."
];
const offense_playmaker = [
  "Visinya dalam mengalirkan bola ({ast} APG) menjaga kelancaran sirkulasi serangan transisi maupun set-play. Ia adalah fasilitator sekunder yang sangat cerdas membaca celah pertahanan lawan.",
  "Ia bertugas menenangkan tempo permainan dan mendistribusikan bola. Dengan Usage Rate rendah ({usg}%), ia bermain sangat efisien tanpa perlu mendominasi penguasaan bola."
];
const offense_stretch = [
  "Sebagai big man modern, kemampuannya menembak dari luar menarik center lawan menjauh dari ring. Hal ini merusak sistem help-defense lawan secara signifikan.",
  "Kombinasi ukuran tubuh dan sentuhan menembak (TS% {ts}%) membuatnya menjadi mismatch mimpi buruk bagi pertahanan drop-coverage konvensional."
];
const offense_wing = [
  "Sebagai pencetak skor sayap agresif, ia menyumbang {pts} poin melalui isolasi dan penetrasi tajam yang merobek rotasi pertahanan lawan di perimeter.",
  "Ia ahli dalam menciptakan tembakannya sendiri dari posisi sayap, memberikan suntikan daya gedor instan saat skema serangan utama tim sedang buntu."
];
const offense_bench = [
  "Ia memberikan intensitas pertahanan dan energi rotasi dari bangku cadangan. Kontribusinya fokus pada hustle plays dan menjaga tempo saat para starter beristirahat.",
  "Perannya sangat taktikal: masuk, bertahan dengan keras, menjaga aliran bola, dan tidak memaksakan tembakan di luar perannya."
];

const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

players.forEach(p => {
  let text = getRand(intro).replace('{name}', p.fullName).replace('{team}', p.team);
  text += " ";
  
  const stats = p.stats;
  const pts = stats.points.toFixed(1);
  const ast = stats.assists.toFixed(1);
  const reb = stats.reboundsTotal.toFixed(1);
  const usg = (stats.usagePercentage * 100).toFixed(1);
  const ts = (stats.trueShootingPercentage * 100).toFixed(1);

  let clusterText = "";
  if (p.cluster_name === 'Franchise Cornerstone') clusterText = getRand(offense_superstar);
  else if (p.cluster_name === 'Pure 3PT Shooter') clusterText = getRand(offense_shooter);
  else if (p.cluster_name === 'Interior Anchor') clusterText = getRand(offense_anchor);
  else if (p.cluster_name === 'Secondary Playmaker') clusterText = getRand(offense_playmaker);
  else if (p.cluster_name === 'Stretch Big') clusterText = getRand(offense_stretch);
  else if (p.cluster_name === 'Two-Way Energy Wing') clusterText = getRand(offense_wing);
  else clusterText = getRand(offense_bench);
  
  clusterText = clusterText
    .replace('{pts}', pts)
    .replace('{ast}', ast)
    .replace('{reb}', reb)
    .replace('{usg}', usg)
    .replace('{ts}', ts);
    
  text += clusterText;
  playerReports[p.personId] = text;
});

fs.writeFileSync(PLAYER_REPORTS_PATH, JSON.stringify(playerReports, null, 2));

// --- MATCHUP GENERATOR ---
const matchupReports = {};
const teamNames = [...new Set(players.map(p => p.team))].sort();

const matchupTemplates = [
  "Pertarungan ini akan ditentukan oleh adu kecepatan transisi. {teamA} akan berusaha mengeksploitasi pertahanan perimeter {teamB} melalui sirkulasi operan cepat. Sebaliknya, {teamB} harus memaksakan permainan setengah lapangan (half-court) dan mendominasi pertarungan fisik di area cat.",
  "Kunci dari skenario taktis ini adalah bagaimana pertahanan drop-coverage {teamA} merespons ancaman penembak jitu dari {teamB}. Jika {teamB} berhasil menemukan ritme tembakan tiga angka mereka, {teamA} terpaksa harus menarik keluar big man mereka, membuka celah penetrasi yang mematikan.",
  "Ini adalah duel klasik antara efisiensi serangan sayap melawan perlindungan ring murni. {teamA} memiliki keunggulan dalam penetrasi ke arah ring, namun rotasi defensif disiplin dari {teamB} dirancang khusus untuk menjebak pergerakan isolasi. Pertarungan rebound akan menjadi penentu akhir laga ini.",
  "Secara analitik, {teamA} harus memperlambat tempo dan menggunakan jebakan ganda (blitz) terhadap ball-handler utama {teamB}. Di sisi lain, {teamB} memiliki amunisi spacing yang cukup luas untuk menghukum rotasi telat dari {teamA}. Tim dengan jumlah turnover paling sedikit kemungkinan besar akan mendominasi.",
  "Keseimbangan kekuatan di bangku cadangan akan menjadi pembeda utama. Starter {teamA} memiliki daya gedor mematikan, tetapi rotasi lini kedua dari {teamB} seringkali mampu merubah momentum pertandingan. Duel strategis di paruh kedua akan menguji kedalaman taktis kedua pelatih."
];

for (let i = 0; i < teamNames.length; i++) {
  for (let j = i + 1; j < teamNames.length; j++) {
    const tA = teamNames[i];
    const tB = teamNames[j];
    const key = `${tA}_vs_${tB}`;
    let text = getRand(matchupTemplates).replace(/{teamA}/g, tA).replace(/{teamB}/g, tB);
    matchupReports[key] = text;
  }
}

fs.writeFileSync(MATCHUP_REPORTS_PATH, JSON.stringify(matchupReports, null, 2));

console.log("✅ Proses generasi AI Hibrida super cepat berhasil diselesaikan!");
