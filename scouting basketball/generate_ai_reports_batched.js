import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'src', 'data');
const PROCESSED_DATA_PATH = path.join(DATA_DIR, 'nba_processed_data.json');
const PLAYER_REPORTS_PATH = path.join(DATA_DIR, 'player_ai_reports.json');
const MATCHUP_REPORTS_PATH = path.join(DATA_DIR, 'matchup_ai_reports.json');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// Kita kembali menggunakan gemini-2.5-flash karena versi 1.5-flash mungkin tidak didukung di region/SDK versi ini
const MODEL_NAME = 'gemini-2.5-flash';

const loadJson = (filePath, defaultObj = {}) => {
  if (fs.existsSync(filePath)) {
    try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch (e) { return defaultObj; }
  }
  return defaultObj;
};

const saveJson = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateBatch(prompt) {
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
          systemInstruction: "You are an elite NBA Scout. Return ONLY a valid JSON object where keys are the IDs/Matchups provided, and values are a solid 1-paragraph tactical scouting report in Indonesian. No markdown, no markdown blocks, just pure JSON string.",
        }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.log(`⚠️ API Error (${error.message}). Retrying...`);
      retries--;
      await sleep(5000);
    }
  }
  return {};
}

async function processPlayersBatched(data) {
  console.log("\n🏀 MEMULAI BATCH GENERATION UNTUK PEMAIN (CARA CEPAT)...");
  let playerReports = loadJson(PLAYER_REPORTS_PATH, {});
  const players = Object.values(data.players).filter(p => !playerReports[p.personId]);
  
  const BATCH_SIZE = 15;
  
  for (let i = 0; i < players.length; i += BATCH_SIZE) {
    const batch = players.slice(i, i + BATCH_SIZE);
    console.log(`Memproses batch pemain ${i + 1} hingga ${i + batch.length} dari ${players.length}...`);
    
    let promptText = "Generate a JSON object with the following keys (personId) and values (tactical report paragraph in Indonesian):\n";
    batch.forEach(p => {
      promptText += `\nID: "${p.personId}"\nName: ${p.fullName}\nTeam: ${p.team}\nCluster: ${p.cluster_name}\nStats: ${p.stats.points.toFixed(1)} PPG, ${p.stats.reboundsTotal.toFixed(1)} RPG, ${p.stats.assists.toFixed(1)} APG, ${p.stats.numMinutes.toFixed(1)} MPG, TS%: ${(p.stats.trueShootingPercentage*100).toFixed(1)}%.\n`;
    });

    const result = await generateBatch(promptText);
    for (const [key, val] of Object.entries(result)) {
      playerReports[key] = val;
    }
    saveJson(PLAYER_REPORTS_PATH, playerReports);
    await sleep(1000); // Small delay to prevent rate limits
  }
  console.log("✅ Pemain selesai!");
}

async function processMatchupsBatched(data) {
  console.log("\n⚔️ MEMULAI BATCH GENERATION UNTUK MATCHUP (CARA CEPAT)...");
  let matchupReports = loadJson(MATCHUP_REPORTS_PATH, {});
  const teamNames = [...new Set(Object.values(data.players).map(p => p.team))].sort();
  
  const matchupsToProcess = [];
  for (let i = 0; i < teamNames.length; i++) {
    for (let j = i + 1; j < teamNames.length; j++) {
      const key = `${teamNames[i]}_vs_${teamNames[j]}`;
      if (!matchupReports[key]) matchupsToProcess.push({ key, tA: teamNames[i], tB: teamNames[j] });
    }
  }

  const BATCH_SIZE = 15;
  for (let i = 0; i < matchupsToProcess.length; i += BATCH_SIZE) {
    const batch = matchupsToProcess.slice(i, i + BATCH_SIZE);
    console.log(`Memproses batch matchup ${i + 1} hingga ${i + batch.length} dari ${matchupsToProcess.length}...`);
    
    let promptText = "Generate a JSON object with the following keys (Matchup ID) and values (tactical matchup summary paragraph in Indonesian):\n";
    batch.forEach(m => {
      promptText += `\nMatchup ID: "${m.key}"\nTeam A: ${m.tA}\nTeam B: ${m.tB}\n`;
    });

    const result = await generateBatch(promptText);
    for (const [key, val] of Object.entries(result)) {
      matchupReports[key] = val;
    }
    saveJson(MATCHUP_REPORTS_PATH, matchupReports);
    await sleep(1000);
  }
  console.log("✅ Matchup selesai!");
}

async function main() {
  const data = loadJson(PROCESSED_DATA_PATH);
  await processPlayersBatched(data);
  await processMatchupsBatched(data);
  console.log("🎉 SEMUA SELESAI!");
}

main();
