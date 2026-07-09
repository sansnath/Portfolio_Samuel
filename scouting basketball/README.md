# NBA Scout AI 🏀🤖

NBA Scout AI is a next-generation sports analytics application that blends real NBA player and team statistics with insights driven by Artificial Intelligence (Generative AI). This application allows users to perform in-depth player scouting, tactical cluster analysis, and comprehensive head-to-head team matchups.

## Main Features

- **Player Scout (Player Analysis):** Provides detailed profiles of 546 NBA players, complete with tailored AI-generated scouting reports based on their playstyle, stats, and tactical weaknesses.
- **Player Clusters (Tactical Archetypes):** Classifies all players into specific tactical roles (such as Franchise Cornerstone, Pure 3PT Shooter, Interior Anchor, etc.) and visualizes them interactively.
- **Team Analysis:** Evaluates the tactical strengths and weaknesses of all 30 NBA teams, including key offensive and defensive summaries.
- **Matchup Simulator (Head-to-Head):** Assesses the potential battle between two teams, matching up their strategies and identifying tactical keys to victory.

## Data, Generative AI Reports & Antigravity 🚀

All intelligent reports (Scouting Reports, Team Overviews, and Matchups) in this application are **static** (stored locally as JSON files in `src/data/`). This static architecture is intentional and serves two crucial purposes:
1. **Absolute Speed (Lightning Fast)**: Loading texts locally eliminates network latency, providing an instant user experience without frustrating spinners.
2. **Cost Efficiency (No API Limits)**: Because data is read offline, there are no live API queries from the web interface. This prevents cloud billing spikes and avoids the risk of hitting daily usage ceilings (Rate Limit Errors).

The raw metrics, advanced stats, **K-Means Clustering** calculations, and thousands of lines of player scouting reports in this app were originally **generated, synthesized, and written by AI Antigravity** (a superintelligent AI Agent). Antigravity processed player statistics, mapped them to their tactical clusters, and converted raw numbers into natural scouting insights, embedding them permanently into the database.

### How the AI Generator Scripts Work (Developer Only)

We have included data generation scripts in the root directory to allow you to dynamically regenerate the AI text files using the official Google Gemini API. This is useful if you wish to update the tone of voice or ingest new season data in the future.

The available scripts are:
1. `generate_ai_reports_batched.js`
2. `generate_fast_ai_reports.cjs`
3. `generate_matchups.cjs`

**Steps to Run the AI Scripts:**
1. Make sure you have a `.env` file in the project's root directory.
2. Add your Gemini API Key:
   ```env
   GEMINI_API_KEY=AIzaSy_your_secret_key_here
   ```
3. Open your terminal and run the script with Node.js. For example:
   ```bash
   node generate_ai_reports_batched.js
   ```
4. The script will fetch raw metrics from `src/data/nba_processed_data.json`, send them to the Gemini LLM with tailored prompts, and overwrite/save the translated or newly generated text into the corresponding JSON report files.
5. Run `npm run build` to update the production bundle with the new insights.

## System Requirements & Local Setup

- **Node.js**: (Version 18+ recommended)
- **Dependency Installation**: 
  ```bash
  npm install
  ```
- **Run Development Server (Localhost)**:
  ```bash
  npm run dev
  ```
- **Build for Production**:
  ```bash
  npm run build
  ```

---
*This application is designed as a stunning portfolio piece demonstrating the marriage of data science, React/Vite frontend development, and local Generative AI pipeline processing.*
