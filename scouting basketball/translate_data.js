import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'src', 'data');
const PLAYER_REPORTS_PATH = path.join(DATA_DIR, 'player_ai_reports.json');
const TEAM_REPORTS_PATH = path.join(DATA_DIR, 'team_ai_reports.json');
const MATCHUP_REPORTS_PATH = path.join(DATA_DIR, 'matchup_ai_reports.json');

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is not set.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateChunk(jsonData, typeName) {
  const prompt = `
You are an expert sports translator. Translate the following JSON data containing Indonesian NBA ${typeName} reports into English.
Ensure the translation is professional, analytical, natural, and poetic. Do NOT use emojis.
Return ONLY the final translated JSON structure. Do not wrap in markdown code blocks like \`\`\`json. Just output raw valid JSON.

JSON:
${JSON.stringify(jsonData, null, 2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });
    
    let text = response.text.trim();
    if (text.startsWith('```json')) {
      text = text.substring(7);
    }
    if (text.endsWith('```')) {
      text = text.substring(0, text.length - 3);
    }
    return JSON.parse(text.trim());
  } catch (error) {
    if (error.status === 429) {
      console.log("⚠️ Rate limit reached. Waiting 30s...");
      await sleep(30000);
      return await translateChunk(jsonData, typeName);
    }
    throw error;
  }
}

async function translatePlayers() {
  console.log("Translating players...");
  const playersData = JSON.parse(fs.readFileSync(PLAYER_REPORTS_PATH, 'utf-8'));
  const entries = Object.entries(playersData);
  const chunkLength = 40;
  const translated = {};

  for (let i = 0; i < entries.length; i += chunkLength) {
    const slice = entries.slice(i, i + chunkLength);
    const chunkObj = Object.fromEntries(slice);
    console.log(`Translating players chunk ${Math.floor(i / chunkLength) + 1}/${Math.ceil(entries.length / chunkLength)}...`);
    const translatedChunk = await translateChunk(chunkObj, "player scouting");
    Object.assign(translated, translatedChunk);
    await sleep(2000);
  }

  fs.writeFileSync(PLAYER_REPORTS_PATH, JSON.stringify(translated, null, 2));
  console.log("Players translated successfully!");
}

async function translateTeams() {
  console.log("Translating teams...");
  const teamsData = JSON.parse(fs.readFileSync(TEAM_REPORTS_PATH, 'utf-8'));
  const entries = Object.entries(teamsData);
  const chunkLength = 10;
  const translated = {};

  for (let i = 0; i < entries.length; i += chunkLength) {
    const slice = entries.slice(i, i + chunkLength);
    const chunkObj = Object.fromEntries(slice);
    console.log(`Translating teams chunk ${Math.floor(i / chunkLength) + 1}/${Math.ceil(entries.length / chunkLength)}...`);
    const translatedChunk = await translateChunk(chunkObj, "team overview");
    Object.assign(translated, translatedChunk);
    await sleep(2000);
  }

  fs.writeFileSync(TEAM_REPORTS_PATH, JSON.stringify(translated, null, 2));
  console.log("Teams translated successfully!");
}

async function translateMatchups() {
  console.log("Translating matchups...");
  const matchupsData = JSON.parse(fs.readFileSync(MATCHUP_REPORTS_PATH, 'utf-8'));
  const entries = Object.entries(matchupsData);
  const chunkLength = 40;
  const translated = {};

  for (let i = 0; i < entries.length; i += chunkLength) {
    const slice = entries.slice(i, i + chunkLength);
    const chunkObj = Object.fromEntries(slice);
    console.log(`Translating matchups chunk ${Math.floor(i / chunkLength) + 1}/${Math.ceil(entries.length / chunkLength)}...`);
    const translatedChunk = await translateChunk(chunkObj, "matchup battle");
    Object.assign(translated, translatedChunk);
    await sleep(2000);
  }

  fs.writeFileSync(MATCHUP_REPORTS_PATH, JSON.stringify(translated, null, 2));
  console.log("Matchups translated successfully!");
}

async function main() {
  try {
    await translateTeams();
    await translatePlayers();
    await translateMatchups();
    console.log("🎉 ALL TRANSLATIONS COMPLETED!");
  } catch (err) {
    console.error("Translation failed:", err);
  }
}

main();
