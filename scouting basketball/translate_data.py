import json
import os
import time
from deep_translator import GoogleTranslator

# Path setup
DATA_DIR = os.path.join(os.path.dirname(__file__), 'src', 'data')
PLAYER_REPORTS_PATH = os.path.join(DATA_DIR, 'player_ai_reports.json')
TEAM_REPORTS_PATH = os.path.join(DATA_DIR, 'team_ai_reports.json')
MATCHUP_REPORTS_PATH = os.path.join(DATA_DIR, 'matchup_ai_reports.json')

translator = GoogleTranslator(source='id', target='en')

def safe_translate(text):
    if not text:
        return ""
    try:
        # Keep retrying on network issues
        for _ in range(5):
            try:
                val = translator.translate(text)
                if val:
                    return val
            except Exception as e:
                print(f"Error: {e}. Retrying in 2s...")
                time.sleep(2)
        return text
    except Exception as e:
        print(f"Failed to translate: {text[:20]}... Error: {e}")
        return text

def translate_players():
    print("Translating Player Reports...")
    with open(PLAYER_REPORTS_PATH, 'r', encoding='utf-8') as f:
        players = json.load(f)
    
    total = len(players)
    count = 0
    translated = {}
    
    for pid, report in players.items():
        count += 1
        if count % 50 == 0:
            print(f"Progress: {count}/{total} players translated...")
        translated[pid] = safe_translate(report)
        
    with open(PLAYER_REPORTS_PATH, 'w', encoding='utf-8') as f:
        json.dump(translated, f, indent=2)
    print("Player Reports Translated!")

def translate_teams():
    print("Translating Team Reports...")
    with open(TEAM_REPORTS_PATH, 'r', encoding='utf-8') as f:
        teams = json.load(f)
        
    translated = {}
    for team_name, data in teams.items():
        print(f"Translating team {team_name}...")
        t_data = {}
        t_data["offensiveStrength"] = safe_translate(data.get("offensiveStrength", ""))
        t_data["offensiveWeakness"] = safe_translate(data.get("offensiveWeakness", ""))
        t_data["defensiveStrength"] = safe_translate(data.get("defensiveStrength", ""))
        t_data["defensiveWeakness"] = safe_translate(data.get("defensiveWeakness", ""))
        t_data["recommendedStrategy"] = [safe_translate(s) for s in data.get("recommendedStrategy", [])]
        translated[team_name] = t_data
        
    with open(TEAM_REPORTS_PATH, 'w', encoding='utf-8') as f:
        json.dump(translated, f, indent=2)
    print("Team Reports Translated!")

def translate_matchups():
    print("Translating Matchup Reports...")
    with open(MATCHUP_REPORTS_PATH, 'r', encoding='utf-8') as f:
        matchups = json.load(f)
        
    total = len(matchups)
    count = 0
    translated = {}
    for key, report in matchups.items():
        count += 1
        if count % 50 == 0:
            print(f"Progress: {count}/{total} matchups translated...")
        translated[key] = safe_translate(report)
        
    with open(MATCHUP_REPORTS_PATH, 'w', encoding='utf-8') as f:
        json.dump(translated, f, indent=2)
    print("Matchup Reports Translated!")

if __name__ == '__main__':
    translate_teams()
    translate_players()
    translate_matchups()
    print("All JSON translations successfully completed!")
