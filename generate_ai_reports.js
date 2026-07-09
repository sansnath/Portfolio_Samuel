import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const DATA_DIR = path.join(__dirname, 'src', 'data');
const PROCESSED_DATA_PATH = path.join(DATA_DIR, 'nba_processed_data.json');
const PLAYER_REPORTS_PATH = path.join(DATA_DIR, 'player_ai_reports.json');
const MATCHUP_REPORTS_PATH = path.join(DATA_DIR, 'matchup_ai_reports.json');

// Ensure API Key exists
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is not set in .env file.");
  console.error("1. Buat file .env di folder project (nba portofolio/.env)");
  console.error("2. Isi dengan: GEMINI_API_KEY=kunci_rahasia_anda");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

// Helpers
const loadJson = (filePath, defaultObj = {}) => {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      return defaultObj;
    }
  }
  return defaultObj;
};

const saveJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateText(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: "You are an elite NBA Scout and Tactical Analyst. Answer in Indonesian. Provide purely analytical and poetic scouting reports. DO NOT use emojis. DO NOT use markdown formatting (no bolding, no lists) unless specified, just write a solid paragraph.",
      }
    });
    return response.text.trim();
  } catch (error) {
    if (error.status === 429) {
      console.log("⚠️ Rate limit reached. Menunggu 30 detik...");
      await sleep(30000);
      return await generateText(prompt); // retry
    }
    throw error;
  }
}

async function processPlayers(data) {
  console.log("\n🏀 MEMULAI GENERASI ANALISIS PEMAIN...");
  let playerReports = loadJson(PLAYER_REPORTS_PATH, {});
  const players = Object.values(data.players);
  let count = 0;

  for (const player of players) {
    if (playerReports[player.personId]) {
      continue; // Skip if already exists
    }

    count++;
    console.log(`[Pemain ${count}] Menulis laporan untuk ${player.fullName} (${player.team})...`);
    
    const prompt = `
Buatkan 1 paragraf (maksimal 3-4 kalimat padat) 'Scouting Report Analysis' (Analisis Taktis) untuk pemain NBA berikut:
Nama: ${player.fullName}
Tim: ${player.team}
Posisi: ${player.position}
Klaster AI (Peran Taktis): ${player.cluster_name}
Statistik Utama: ${player.stats.points.toFixed(1)} PPG, ${player.stats.reboundsTotal.toFixed(1)} RPG, ${player.stats.assists.toFixed(1)} APG, ${player.stats.numMinutes.toFixed(1)} MPG.
True Shooting: ${(player.stats.trueShootingPercentage * 100).toFixed(1)}%, Usage Rate: ${(player.stats.usagePercentage * 100).toFixed(1)}%

Instruksi:
Tulis deskripsi taktis profesional dan analitik tentang bagaimana pemain ini berfungsi dalam sistem tim berdasarkan peran klasternya. Jangan gunakan emoji. Jangan gunakan pembuka/penutup basa-basi. Tulis langsung paragrafnya.
`;

    try {
      const text = await generateText(prompt);
      playerReports[player.personId] = text;
      saveJson(PLAYER_REPORTS_PATH, playerReports);
      await sleep(1500); // 1.5s delay to respect free tier limits
    } catch (err) {
      console.error(`Gagal generate untuk ${player.fullName}:`, err.message);
    }
  }
  
  if (count === 0) console.log("✅ Semua pemain sudah di-generate!");
  else console.log(`✅ Selesai men-generate ${count} pemain baru.`);
}

async function processMatchups(data) {
  console.log("\n⚔️ MEMULAI GENERASI SKENARIO KOMPARASI TIM (MATCHUP)...");
  let matchupReports = loadJson(MATCHUP_REPORTS_PATH, {});
  
  // Extract team names
  const teamNames = [...new Set(Object.values(data.players).map(p => p.team))].sort();
  
  let count = 0;
  for (let i = 0; i < teamNames.length; i++) {
    for (let j = i + 1; j < teamNames.length; j++) {
      const teamA = teamNames[i];
      const teamB = teamNames[j];
      const matchupKey = `${teamA}_vs_${teamB}`; // Deterministic key
      
      if (matchupReports[matchupKey]) {
        continue;
      }
      
      count++;
      console.log(`[Matchup ${count}] Menganalisis ${teamA} vs ${teamB}...`);

      const prompt = `
Buatkan 1 paragraf (maksimal 4-5 kalimat) 'Tactical Matchup Summary' untuk skenario pertandingan antara ${teamA} dan ${teamB}.

Gunakan pengetahuan bola basket NBA mendalam Anda tentang gaya bermain asli kedua tim ini. 
Bagaimana strategi ${teamA} akan berbenturan dengan taktik ${teamB}? Area mana yang akan menjadi medan pertempuran utama (key battleground)?

Instruksi:
Tulis analisis teknis dan taktis yang tajam (seperti analis profesional). Jangan gunakan emoji. Jangan gunakan list/bullet points. Tulis 1 paragraf solid dalam bahasa Indonesia.
`;

      try {
        const text = await generateText(prompt);
        matchupReports[matchupKey] = text;
        saveJson(MATCHUP_REPORTS_PATH, matchupReports);
        await sleep(2000); // 2s delay
      } catch (err) {
        console.error(`Gagal generate matchup ${matchupKey}:`, err.message);
      }
    }
  }

  if (count === 0) console.log("✅ Semua skenario matchup sudah di-generate!");
  else console.log(`✅ Selesai men-generate ${count} skenario matchup baru.`);
}

async function main() {
  console.log("🚀 Memulai NBA Scout AI Generator...");
  const data = loadJson(PROCESSED_DATA_PATH);
  
  if (!data || !data.players) {
    console.error("❌ ERROR: nba_processed_data.json tidak ditemukan.");
    return;
  }

  await processPlayers(data);
  await processMatchups(data);
  
  console.log("\n🎉 SELURUH PROSES SELESAI!");
}

main();
