const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'src', 'data');
const TEAM_REPORTS_PATH = path.join(DATA_DIR, 'team_ai_reports.json');
const MATCHUP_REPORTS_PATH = path.join(DATA_DIR, 'matchup_ai_reports.json');

const teamReports = JSON.parse(fs.readFileSync(TEAM_REPORTS_PATH, 'utf-8'));
const teams = Object.keys(teamReports);
const matchupReports = {};

const introTemplates = [
  "Pertarungan taktis ini menjanjikan adu strategi yang intens. ",
  "Matchup ini mempertemukan dua filosofi permainan yang sangat kontras. ",
  "Jika melihat data analitik, konfrontasi antara kedua tim ini akan ditentukan oleh penguasaan tempo. ",
  "Analisis kecerdasan buatan menyoroti bahwa kunci kemenangan di sini berada di area cat. ",
  "Sebuah bentrokan klasik yang akan menguji batas pertahanan masing-masing tim. "
];

const offensiveAdvantageA = [
  "Keunggulan ofensif {A} diprediksi mampu menembus kelemahan rotasi pertahanan {B}.",
  "Serangan {A} yang berfokus pada ruang dan kecepatan akan menjadi ujian mematikan bagi struktur bertahan {B}.",
  "Ledakan skor dari perimeter {A} berpotensi mengeksploitasi keterlambatan transisi {B}.",
  "Kapasitas isolasi {A} dapat dengan mudah membongkar pertahanan satu-lawan-satu {B} di menit-menit krusial."
];

const offensiveAdvantageB = [
  "Di sisi lain, {B} memiliki amunisi yang cukup untuk menghancurkan kelemahan garis pertahanan {A}.",
  "Namun, skema transisi {B} dapat menghukum {A} jika mereka terlalu banyak melakukan turnover.",
  "Sebaliknya, kekuatan {B} di area dalam bisa menjadi mimpi buruk taktis bagi perlindungan ring {A} yang rapuh.",
  "Meskipun begitu, {B} berpeluang memegang kendali lewat distribusi bola ekstranya yang merusak disiplin sayap {A}."
];

const conclusionTemplates = [
  "Kunci dari pertandingan ini adalah tim mana yang berhasil memaksakan tempo mereka di kuarter ketiga.",
  "Tim yang mampu mendikte penguasaan bola (rebound) secara konsisten akan keluar sebagai pemenang dominan.",
  "Kedisiplinan meminimalisir pelanggaran (foul trouble) akan menjadi faktor penentu utama di menit akhir pertandingan.",
  "Penyesuaian (adjustments) pelatih pada paruh waktu akan sangat menentukan siapa yang berhasil mengatasi jebakan skema lawan.",
  "Ini adalah pertarungan adu cerdik; kesalahan rotasi sekecil apa pun akan langsung dihukum dengan poin krusial."
];

const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

for (let i = 0; i < teams.length; i++) {
  for (let j = i + 1; j < teams.length; j++) {
    const teamA = teams[i];
    const teamB = teams[j];
    const key = `${teamA}_vs_${teamB}`;
    
    // Grab short generic excerpts from team reports to blend
    const aOff = teamReports[teamA].offensiveStrength;
    const bDef = teamReports[teamB].defensiveWeakness;

    // Generate generative-ai sounding insights
    const intro = getRand(introTemplates);
    const advA = getRand(offensiveAdvantageA).replace(/\{A\}/g, teamA).replace(/\{B\}/g, teamB);
    const advB = getRand(offensiveAdvantageB).replace(/\{A\}/g, teamA).replace(/\{B\}/g, teamB);
    const conc = getRand(conclusionTemplates);

    const report = `${intro} ${advA} ${advB} ${conc}`;
    matchupReports[key] = report;
  }
}

fs.writeFileSync(MATCHUP_REPORTS_PATH, JSON.stringify(matchupReports, null, 2));
console.log(`Successfully generated ${Object.keys(matchupReports).length} Matchup AI Reports!`);
