# -*- coding: utf-8 -*-
"""
NBA Scout AI — Data Processor
=======================================================
Memproses PlayerStatisticsExtended.csv (Regular Season 2025-2026)
Pipeline:
  1. Baca & bersihkan data
  2. Agregasi per pemain
  3. Normalisasi Per-36 Menit
  4. PCA per dimensi (Scoring / Playmaking / Defense)
  5. KMeans K=7 Clustering
  6. Penamaan cluster berdasarkan karakteristik statistik
  7. Nearest Neighbors (3 pemain paling mirip)
  8. Agregasi statistik tim
  9. Ekspor → src/data/nba_processed_data.json
"""
import sys, io, json, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.neighbors import NearestNeighbors
import warnings
warnings.filterwarnings('ignore')


# KONFIGURASI

K_CLUSTERS      = 7
RANDOM_STATE    = 42
MIN_MINUTES     = 5      # Rata-rata menit minimum per game
MIN_GAMES       = 5      # Minimum game dimainkan
N_SIMILAR       = 5      # Jumlah similar players

OUTPUT_PATH     = os.path.join('src', 'data', 'nba_processed_data.json')


# FEATURE DEFINITIONS

# Counting stats → akan dinormalisasi ke Per-36 menit
COUNTING_COLS = [
    'points', 'fieldGoalsAttempted', 'fieldGoalsMade',
    'threePointersMade', 'threePointersAttempted',
    'freeThrowsMade', 'freeThrowsAttempted',
    'pointsInPaint', 'assists', 'turnovers', 'possessions',
    'steals', 'blocks', 'reboundsTotal',
    'reboundsOffensive', 'reboundsDefensive', 'foulsPersonal',
]

# Rate / percentage stats → dipakai as-is
RATE_COLS = [
    'trueShootingPercentage', 'usagePercentage',
    'fieldGoalsPercentage', 'threePointersPercentage', 'freeThrowsPercentage',
    'percentPoints3Point', 'percentPointsInPaint',
    'percentPoints2PointMidRange', 'percentPointsFastBreak',
    'percentAssisted3PointMade', 'percentUnassisted2PointMade',
    'percentAssistedFieldGoalsMade', 'percentUnassistedFieldGoalsMade',
    'assistPercentage', 'assistRatio', 'assistToTurnoverRatio',
    'percentTeamAssists', 'percentPointsOffTurnovers',
    'defensiveRating', 'offensiveRating',
    'offensiveReboundPercentage', 'defensiveReboundPercentage',
    'percentTeamBlocks', 'percentTeamSteals',
    'effectiveFieldGoalPercentage',
]

ALL_RAW_FEATURES = COUNTING_COLS + RATE_COLS

# Nama kolom setelah per-36 konversi
COUNTING_P36 = [c + '_p36' for c in COUNTING_COLS]

# Pengelompokan PCA (pakai nama _p36 untuk counting)
SCORING_FEATURES = [
    'points_p36', 'fieldGoalsAttempted_p36', 'threePointersMade_p36',
    'threePointersAttempted_p36', 'freeThrowsAttempted_p36',
    'trueShootingPercentage', 'usagePercentage', 'effectiveFieldGoalPercentage',
    'percentPoints3Point', 'percentPointsInPaint',
    'percentPoints2PointMidRange', 'percentPointsFastBreak',
    'pointsInPaint_p36', 'percentAssisted3PointMade',
    'percentUnassisted2PointMade', 'percentAssistedFieldGoalsMade',
]

PLAYMAKING_FEATURES = [
    'assists_p36', 'assistPercentage', 'assistRatio',
    'assistToTurnoverRatio', 'turnovers_p36',
    'percentTeamAssists', 'percentPointsOffTurnovers', 'possessions_p36',
]

DEFENSE_FEATURES = [
    'steals_p36', 'blocks_p36', 'defensiveRating',
    'reboundsTotal_p36', 'reboundsOffensive_p36', 'reboundsDefensive_p36',
    'offensiveReboundPercentage', 'defensiveReboundPercentage',
    'percentTeamBlocks', 'percentTeamSteals', 'foulsPersonal_p36',
]

PCA_FEATURES = SCORING_FEATURES + PLAYMAKING_FEATURES + DEFENSE_FEATURES

# Kolom display (raw averages, untuk ditampilkan di UI)
DISPLAY_STATS = [
    'points', 'assists', 'reboundsTotal', 'steals', 'blocks',
    'fieldGoalsMade', 'fieldGoalsAttempted', 'fieldGoalsPercentage',
    'threePointersMade', 'threePointersAttempted', 'threePointersPercentage',
    'freeThrowsMade', 'freeThrowsAttempted', 'freeThrowsPercentage',
    'reboundsOffensive', 'reboundsDefensive',
    'turnovers', 'foulsPersonal', 'plusMinusPoints',
    'trueShootingPercentage', 'effectiveFieldGoalPercentage',
    'usagePercentage', 'assistRatio', 'assistPercentage',
    'offensiveRating', 'defensiveRating',
    'offensiveReboundPercentage', 'defensiveReboundPercentage',
    'numMinutes',
]



# HELPER FUNCTIONS

def clean_numeric(val):
    if pd.isna(val):
        return 0.0
    s = str(val).strip().replace(',', '.')
    parts = s.split('.')
    if len(parts) > 2:
        s = parts[0] + '.' + parts[1]
    try:
        return float(s)
    except ValueError:
        return 0.0


def safe_round(val, n=2):
    try:
        return round(float(val), n)
    except:
        return 0.0


def label_cluster(cluster_id, cluster_means):
    """
    Penamaan cluster deterministik berdasarkan lookup table.

    Observasi dari cluster_inspector.py (random_state=42, n_init=20, K=7):
      Cluster 0 (104p): 3PA/36=8.1, %PTS3PT=29.5%, USG rendah, AST rendah
                        → Pure 3PT Shooter  (Buddy Hield, Klay Thompson)
      Cluster 1 (102p): STL/36▲, ORB/36▲, DRTG terbaik, %PTSPaint▲
                        → Two-Way Energy Wing  (Gary Payton II, Gradey Dick)
      Cluster 2  (71p): REB/36=11.8▲▲, BLK/36=1.66▲▲, 3PA≈0, %PTSPaint=49.6%
                        → Interior Anchor  (big man klasik)
      Cluster 3  (53p): AST Ratio=28.9▲▲, AST%=14.6%▲▲, AST/TO=1.43▲
                        → Secondary Playmaker  (Jalen Suggs, Derrick White)
      Cluster 4  (64p): REB sedang, 3PA sedang, BLK sedang, stretch profile
                        → Stretch Big
      Cluster 5  (69p): PTS/36=23.1▲▲, AST=7.0▲▲, FTA=5.6▲▲, ORTG=114▲▲
                        → Superstar  (Luka, SGA, Giannis, Embiid, Curry)
      Cluster 6  (83p): PTS/36=20.3▲, 3PA/36=7.4 tertinggi, AST rendah
                        → Volume Wing Scorer  (Anthony Edwards, Lauri Markkanen)

    Referensi:
      - Basketball Reference player type classifications
      - Cleaning The Glass role archetypes
      - Second Spectrum player profiling
    """
    CLUSTER_LABELS = {
        0: {
            'name' : 'Interior Anchor',
            'desc' : (
                'Big man tradisional yang mendominasi area cat secara total. Rebound per 36 '
                'menit jauh di atas rata-rata liga (hampir dua kali lipat), block rate tinggi, '
                'dan hampir tidak pernah menembak dari luar area paint. Kehadiran pemain '
                'cluster ini memberikan ancaman rebound offensif dan proteksi ring yang kuat '
                'bagi timnya.'
            ),
            'color': '#ef4444',
        },
        1: {
            'name' : 'Secondary Playmaker',
            'desc' : (
                'Pemain dengan kemampuan distribusi bola tinggi yang berperan sebagai motor '
                'sekunder penggerak serangan tim. Assist ratio dan assist percentage berada '
                'jauh di atas rata-rata liga, menandakan kemampuan menciptakan peluang bagi '
                'rekan setim tanpa harus mendominasi ball possession. Profil ini lazim pada '
                'combo guard dan two-way point forward.'
            ),
            'color': '#3b82f6',
        },
        2: {
            'name' : 'Pure 3PT Shooter',
            'desc' : (
                'Pemain yang hampir seluruh kontribusi ofensifnya berasal dari tembakan '
                'tiga angka. Memiliki volume attempt tiga angka per 36 menit tertinggi '
                'di liga dengan assist dan usage rate yang rendah. Peran utamanya adalah '
                'memberikan spacing bagi rekan setim dan menghukum pertahanan yang tidak '
                'menjaganya secara ketat.'
            ),
            'color': '#f97316',
        },
        3: {
            'name' : 'Two-Way Energy Wing',
            'desc' : (
                'Pemain dengan kontribusi defensif dan hustle play yang menonjol. '
                'Steal per 36 menit dan offensive rebound percentage di atas rata-rata liga, '
                'disertai dengan defensive rating yang kompetitif. Cluster ini identik dengan '
                'pemain yang memberikan energi dan intensitas dari bangku cadangan maupun '
                'rotasi pertahanan utama.'
            ),
            'color': '#22c55e',
        },
        4: {
            'name' : 'Stretch Big',
            'desc' : (
                'Big man modern yang menggabungkan kemampuan rebound dan pertahanan area dalam '
                'dengan ancaman tembakan dari jarak menengah atau tiga angka. Kehadiran pemain '
                'cluster ini membuka ruang penetrasi bagi guard karena menarik lawan keluar '
                'dari area paint, sehingga menjadi komponen penting dalam sistem spacing '
                'offense modern NBA.'
            ),
            'color': '#06b6d4',
        },
        5: {
            'name' : 'Franchise Cornerstone',
            'desc' : (
                'Pemain inti dengan dampak dominan di semua aspek permainan. PTS per 36 '
                'menit, assist, free throw attempt, dan offensive rating semuanya berada di '
                'level tertinggi di antara seluruh cluster. Usage rate tinggi menandakan '
                'ketergantungan besar tim terhadap pemain ini sebagai opsi utama serangan. '
                'Cluster ini merepresentasikan fondasi utama sebuah tim dan All-Star caliber performers.'
            ),
            'color': '#f59e0b',
        },
        6: {
            'name' : 'Bench Rotation Piece',
            'desc' : (
                'Pemain cadangan lapis akhir dengan beban menit bermain yang sangat rendah. '
                'Mereka dimainkan untuk mengisi waktu rotasi sementara dan mencatatkan '
                'produksi statistik yang minim di hampir seluruh kategori utama.'
            ),
            'color': '#9ca3af',
        },
    }
    return CLUSTER_LABELS.get(cluster_id, {
        'name' : f'Cluster {cluster_id}',
        'desc' : 'Kelompok pemain dengan profil statistik campuran.',
        'color': '#6b7280',
    })


# STEP 1 — LOAD & PREPROCESS DATA

def load_data(filepath):
    print('\n[1/6] Membaca & membersihkan dataset...')
    df = pd.read_csv(filepath, sep=';', low_memory=False)
    df_reg = df[df['gameType'] == 'Regular Season'].copy()
    print(f'      Total baris Regular Season : {len(df_reg):,}')

    # Kolom tambahan untuk display
    extra_display = [c for c in DISPLAY_STATS if c not in ALL_RAW_FEATURES + ['numMinutes', 'plusMinusPoints']]
    all_to_clean  = list(set(ALL_RAW_FEATURES + DISPLAY_STATS + ['numMinutes', 'plusMinusPoints']))

    for col in all_to_clean:
        if col in df_reg.columns:
            df_reg[col] = df_reg[col].apply(clean_numeric)

    return df_reg



# STEP 2 — AGGREGATE PER PLAYER

def aggregate_players(df_reg):
    print('\n[2/6] Agregasi statistik rata-rata per pemain...')

    # Ambil posisi paling sering dimainkan per personId + team
    pos_df = (
        df_reg.groupby(['personId', 'playerteamName', 'startingPosition'])
        .size()
        .reset_index(name='pos_count')
    )
    # Ambil baris dengan count terbesar per player
    pos_df = pos_df.sort_values('pos_count', ascending=False).groupby(['personId', 'playerteamName']).first().reset_index()
    pos_map = {(r['personId'], r['playerteamName']): r['startingPosition'] for _, r in pos_df.iterrows()}

    agg_cols = list(set(ALL_RAW_FEATURES + DISPLAY_STATS + ['numMinutes', 'plusMinusPoints']))
    agg_dict = {col: 'mean' for col in agg_cols if col in df_reg.columns}
    agg_dict['gameId'] = 'count'

    # Group tanpa startingPosition agar baris pemain tidak terduplikasi
    ps = (
        df_reg
        .groupby(['personId', 'firstName', 'lastName', 'playerteamName'])
        .agg(agg_dict)
        .reset_index()
    )

    # Filter minimal menit dan game
    ps = ps[(ps['numMinutes'] >= MIN_MINUTES) & (ps['gameId'] >= MIN_GAMES)].copy()
    ps.rename(columns={'gameId': 'gamesPlayed'}, inplace=True)

    # Petakan kembali posisi yang sudah dibersihkan
    ps['position'] = ps.apply(lambda r: pos_map.get((r['personId'], r['playerteamName']), 'N/A'), axis=1)
    ps['position'] = ps['position'].fillna('').apply(lambda x: x.strip() if x else 'N/A')

    pos_map_ai = {
      "Kyle Lowry": "G", "Jeff Green": "F", "Klay Thompson": "G", "Kelly Olynyk": "C",
      "Seth Curry": "G", "Doug McDermott": "F", "Kyle Anderson": "F", "Bogdan Bogdanovic": "G",
      "Tyus Jones": "G", "Pat Connaughton": "G", "Buddy Hield": "G", "Caris LeVert": "G",
      "Gary Payton II": "G", "Guerschon Yabusele": "F", "Alex Caruso": "G", "Markelle Fultz": "G",
      "Lonzo Ball": "G", "Jonathan Isaac": "F", "Luke Kennard": "G", "Tony Bradley": "C",
      "Jevon Carter": "G", "Anfernee Simons": "G", "Moritz Wagner": "C", "Robert Williams III": "C",
      "Jordan McLaughlin": "G", "Gabe Vincent": "G", "Drew Eubanks": "C", "Haywood Highsmith": "F",
      "De'Andre Hunter": "F", "Coby White": "G", "Keldon Johnson": "F", "Charles Bassey": "C",
      "Matisse Thybulle": "G", "Cole Anthony": "G", "Josh Green": "G", "Omer Yurtseven": "C",
      "Vit Krejci": "G", "Lindy Waters III": "G", "Jeremiah Robinson-Earl": "F", "Ochai Agbaji": "G",
      "Bones Hyland": "G", "Isaiah Jackson": "C", "Tre Mann": "G", "Johnny Juzang": "G",
      "Cam Thomas": "G", "Isaiah Livers": "F", "DeJon Jarreau": "G", "Moussa Cisse": "C",
      "Jose Alvarado": "G", "A.J. Lawson": "G", "Mac McClung": "G", "Dru Smith": "G",
      "Jaden Hardy": "G", "TyTy Washington Jr.": "G", "Malaki Branham": "G", "Blake Wesley": "G",
      "Nikola Jovic": "F", "Jeremy Sochan": "F", "JD Davison": "G", "Jabari Walker": "F",
      "Leonard Miller": "F", "Jaime Jaquez Jr.": "F", "Ousmane Dieng": "F", "Tyler Burton": "F",
      "Dalen Terry": "G", "Tyrese Martin": "G", "Trayce Jackson-Davis": "C", "David Roddy": "F",
      "Vince Williams Jr.": "G", "Rayan Rupert": "G", "Jett Howard": "G", "Trey Alexander": "G",
      "Nick Smith Jr.": "G", "Kevin McCullar Jr.": "G", "Julian Phillips": "F", "Dillon Jones": "F",
      "Ronald Holland II": "F", "Duop Reath": "C", "Tyler Smith": "F", "Trey Jemison III": "C",
      "Dalton Knecht": "G", "Rob Dillingham": "G", "Jared McCain": "G", "Tidjane Salaun": "F",
      "Tyler Kolek": "G", "Keshad Johnson": "F", "Cam Christie": "G", "KJ Simpson": "G",
      "Bronny James": "G", "AJ Johnson": "G", "Pacome Dadiet": "G", "Jonathan Mogbo": "F",
      "Walter Clayton Jr.": "G", "Isaiah Crawford": "F", "Zyon Pullin": "G", "Tristan Enaruna": "F",
      "Chaz Lanier": "G", "Riley Minix": "F", "Tolu Smith": "C", "Yuki Kawamura": "G",
      "Jase Richardson": "G", "Liam McNeeley": "F", "Carter Bryant": "F", "Adou Thiero": "G",
      "Tyrese Proctor": "G", "Koby Brea": "G", "Hansen Yang": "C", "John Tonje": "G",
      "Rocco Zikarsky": "C", "Alijah Martin": "G", "Dylan Cardwell": "C", "Curtis Jones": "G",
      "Miles Kelly": "G", "Yanic Konan Niederhauser": "C", "Chris Youngblood": "G",
      "Brooks Barnhizer": "G", "John Poulakidas": "G", "Taelon Peter": "G", "Chris Manon": "G"
    }

    def fix_pos(row):
        p = row['position']
        if p == 'G/F' or p == 'N/A' or p == '':
            fullname = f"{row['firstName']} {row['lastName']}".strip()
            return pos_map_ai.get(fullname, 'G')
        if 'G' in p: return 'G'
        if 'C' in p: return 'C'
        if 'F' in p: return 'F'
        return p

    ps['position'] = ps.apply(fix_pos, axis=1)

    print(f'      Total pemain unik: {len(ps):,}')
    return ps



# STEP 3 — PER-36 NORMALIZATION

def normalize_per36(ps):
    print('\n[3/6] Normalisasi Per-36 Menit (counting stats)...')
    for col in COUNTING_COLS:
        if col in ps.columns:
            p36_col = col + '_p36'
            ps[p36_col] = ps.apply(
                lambda r: (r[col] / r['numMinutes']) * 36 if r['numMinutes'] > 0 else 0.0,
                axis=1
            )
    print(f'      {len(COUNTING_COLS)} kolom counting → Per-36 | {len(RATE_COLS)} kolom rate → as-is')
    return ps



# STEP 4 — PCA + KMEANS CLUSTERING (K=7)

def run_clustering(ps):
    print(f'\n[4/6] PCA per dimensi → KMeans K={K_CLUSTERS}...')

    def group_pca(df, features, n_comp, name):
        available = [f for f in features if f in df.columns]
        X = df[available].fillna(0).values
        X_scaled = StandardScaler().fit_transform(X)
        pca = PCA(n_components=n_comp, random_state=RANDOM_STATE)
        X_pca = pca.fit_transform(X_scaled)
        var = pca.explained_variance_ratio_.sum() * 100
        print(f'      [{name:<12}] {len(available)} fitur → {n_comp} PC | Variance: {var:.1f}%')
        return X_pca

    X_sc = group_pca(ps, SCORING_FEATURES,    2, 'SCORING')
    X_pm = group_pca(ps, PLAYMAKING_FEATURES, 2, 'PLAYMAKING')
    X_df = group_pca(ps, DEFENSE_FEATURES,    2, 'DEFENSE')

    # One-hot encode position
    ps['is_G'] = (ps['position'] == 'G').astype(float)
    ps['is_F'] = (ps['position'] == 'F').astype(float)
    ps['is_C'] = (ps['position'] == 'C').astype(float)

    # We apply a smaller weight (e.g., 0.2) to positional features 
    # so KMeans nudges them but doesn't overpower superstar stats
    pos_weight = 0.2
    X_pos = ps[['is_G', 'is_F', 'is_C']].values * pos_weight

    # Injecting standardized raw metrics to overcome Per-36 illusions
    X_min = StandardScaler().fit_transform(ps[['numMinutes']].fillna(0).values) * 1.0
    X_star = StandardScaler().fit_transform(ps[['points_p36', 'usagePercentage']].fillna(0).values) * 1.0

    X_combined = np.hstack([X_sc, X_pm, X_df, X_pos, X_min, X_star])
    print(f'      Input KMeans: {X_combined.shape[0]} pemain × {X_combined.shape[1]} komponen (pos_w={pos_weight}, min_w=1.0, star_w=1.0)')

    kmeans = KMeans(n_clusters=K_CLUSTERS, random_state=RANDOM_STATE, n_init=20, max_iter=500)
    ps['cluster_id'] = kmeans.fit_predict(X_combined)

    # Simpan scaled features untuk nearest neighbors
    return ps, X_combined



# STEP 5 — CLUSTER NAMING

def name_clusters(ps):
    print('\n[5/6] Penamaan cluster berdasarkan karakteristik statistik...')
    p36_rate_cols = COUNTING_P36 + RATE_COLS
    available = [c for c in p36_rate_cols if c in ps.columns]

    cluster_means = {}
    for cid in range(K_CLUSTERS):
        subset = ps[ps['cluster_id'] == cid]
        cluster_means[cid] = subset[available].mean().to_dict()

    cluster_labels = {}
    for cid in range(K_CLUSTERS):
        info = label_cluster(cid, cluster_means)
        cluster_labels[cid] = info
        count = len(ps[ps['cluster_id'] == cid])
        print(f'      Cluster {cid}: [{info["name"]}] — {count} pemain')

    ps['cluster_name']  = ps['cluster_id'].map(lambda c: cluster_labels[c]['name'])
    ps['cluster_color'] = ps['cluster_id'].map(lambda c: cluster_labels[c]['color'])
    ps['cluster_desc']  = ps['cluster_id'].map(lambda c: cluster_labels[c]['desc'])
    
    # Debug specific players
    lonzo = ps[ps['lastName'] == 'Ball']
    embiid = ps[ps['lastName'] == 'Embiid']
    if not lonzo.empty: print("      DEBUG Lonzo Ball:", lonzo.iloc[0]['cluster_name'])
    if not embiid.empty: print("      DEBUG Joel Embiid:", embiid.iloc[0]['cluster_name'])

    return ps, cluster_labels, cluster_means



# STEP 6 — NEAREST NEIGHBORS (Similar Players)

def find_similar_players(ps, X_combined):
    print(f'\n[6/6] Mencari {N_SIMILAR} similar players per pemain (Nearest Neighbors)...')
    nn = NearestNeighbors(n_neighbors=N_SIMILAR + 1, metric='euclidean')
    nn.fit(X_combined)
    distances, indices = nn.kneighbors(X_combined)

    similar_map = {}
    for i, row in ps.reset_index(drop=True).iterrows():
        pid = str(int(row['personId']))
        neighbors = []
        for j_idx, dist in zip(indices[i][1:], distances[i][1:]):
            nb = ps.iloc[j_idx]
            neighbors.append({
                'personId'  : str(int(nb['personId'])),
                'name'      : f"{nb['firstName']} {nb['lastName']}",
                'team'      : nb['playerteamName'],
                'cluster'   : nb['cluster_name'],
                'similarity': safe_round(1 / (1 + dist), 4)
            })
        similar_map[pid] = neighbors
    return similar_map



# BUILD OUTPUT JSON

def build_json(ps, cluster_labels, cluster_means, similar_map):
    print('\n[+] Menyusun struktur JSON...')

    # ── Players ──────────────────────────────────────────────────────
    players_list = []
    for _, r in ps.iterrows():
        pid = str(int(r['personId']))
        stat_obj = {}
        for col in DISPLAY_STATS:
            if col in r.index:
                stat_obj[col] = safe_round(r[col])

        # Tambahkan per-36 stats ke output
        for col in COUNTING_COLS:
            p36_col = col + '_p36'
            if p36_col in r.index:
                stat_obj[p36_col] = safe_round(r[p36_col])

        players_list.append({
            'personId'      : pid,
            'firstName'     : r['firstName'],
            'lastName'      : r['lastName'],
            'fullName'      : f"{r['firstName']} {r['lastName']}",
            'team'          : r['playerteamName'],
            'position'      : r.get('position', 'N/A'),
            'gamesPlayed'   : int(r['gamesPlayed']),
            'cluster_id'    : int(r['cluster_id']),
            'cluster_name'  : r['cluster_name'],
            'cluster_color' : r['cluster_color'],
            'cluster_desc'  : r['cluster_desc'],
            'stats'         : stat_obj,
            'similar_players': similar_map.get(pid, [])
        })

    # ── Teams ─────────────────────────────────────────────────────────
    team_groups = ps.groupby('playerteamName')
    teams_list  = []
    for team_name, grp in team_groups:
        # Cluster composition
        comp = grp['cluster_name'].value_counts().to_dict()

        # Rata-rata statistik tim (dari raw display stats)
        team_stats = {}
        for col in ['points', 'assists', 'reboundsTotal', 'offensiveRating',
                    'defensiveRating', 'usagePercentage', 'trueShootingPercentage',
                    'steals', 'blocks', 'turnovers']:
            if col in grp.columns:
                team_stats[col] = safe_round(grp[col].mean())

        roster = []
        for _, pr in grp.iterrows():
            roster.append({
                'personId'    : str(int(pr['personId'])),
                'fullName'    : f"{pr['firstName']} {pr['lastName']}",
                'position'    : pr.get('position', 'N/A'),
                'cluster_name': pr['cluster_name'],
                'cluster_color': pr['cluster_color'],
                'gamesPlayed' : int(pr['gamesPlayed']),
                'pts'         : safe_round(pr['points']),
                'ast'         : safe_round(pr['assists']),
                'reb'         : safe_round(pr['reboundsTotal']),
                'numMinutes'  : safe_round(pr['numMinutes']),
            })

        teams_list.append({
            'team'             : team_name,
            'roster'           : roster,
            'cluster_composition': comp,
            'stats'            : team_stats,
            'total_players'    : len(grp),
        })

    # ── Clusters Summary ──────────────────────────────────────────────
    clusters_summary = []
    for cid, info in cluster_labels.items():
        count = len(ps[ps['cluster_id'] == cid])
        means = cluster_means[cid]
        top_players = (
            ps[ps['cluster_id'] == cid]
            .nlargest(5, 'points')
            [['firstName', 'lastName', 'playerteamName', 'points']]
            .apply(lambda r: {
                'name': f"{r['firstName']} {r['lastName']}",
                'team': r['playerteamName'],
                'pts' : safe_round(r['points'])
            }, axis=1)
            .tolist()
        )
        clusters_summary.append({
            'cluster_id'  : cid,
            'name'        : info['name'],
            'desc'        : info['desc'],
            'color'       : info['color'],
            'count'       : count,
            'top_players' : top_players,
            'avg_stats'   : {
                'pts_p36' : safe_round(means.get('points_p36', 0)),
                'ast_p36' : safe_round(means.get('assists_p36', 0)),
                'reb_p36' : safe_round(means.get('reboundsTotal_p36', 0)),
                'stl_p36' : safe_round(means.get('steals_p36', 0)),
                'blk_p36' : safe_round(means.get('blocks_p36', 0)),
                'usg'     : safe_round(means.get('usagePercentage', 0)),
                'ts_pct'  : safe_round(means.get('trueShootingPercentage', 0)),
                'ast_ratio': safe_round(means.get('assistRatio', 0)),
                'ortg'    : safe_round(means.get('offensiveRating', 0)),
                'drtg'    : safe_round(means.get('defensiveRating', 0)),
            }
        })

    # ── League Overview ───────────────────────────────────────────────
    league_overview = {
        'total_players'   : len(players_list),
        'total_teams'     : len(teams_list),
        'total_clusters'  : K_CLUSTERS,
        'season'          : '2025-2026 Regular Season',
        'avg_pts'         : safe_round(ps['points'].mean()),
        'avg_ast'         : safe_round(ps['assists'].mean()),
        'avg_reb'         : safe_round(ps['reboundsTotal'].mean()),
        'avg_ortg'        : safe_round(ps['offensiveRating'].mean()),
        'avg_drtg'        : safe_round(ps['defensiveRating'].mean()),
        'avg_ts_pct'      : safe_round(ps['trueShootingPercentage'].mean()),
    }

    return {
        'meta'            : league_overview,
        'clusters'        : clusters_summary,
        'players'         : players_list,
        'teams'           : teams_list,
    }



# MAIN

if __name__ == '__main__':
    print('=' * 60)
    print('  NBA Scout AI — Data Processor (K=7, Per-36 + PCA)')
    print('=' * 60)

    df_reg   = load_data('PlayerStatisticsExtended.csv')
    ps       = aggregate_players(df_reg)
    ps       = normalize_per36(ps)
    ps, X    = run_clustering(ps)
    ps, cl, cm = name_clusters(ps)
    sim_map  = find_similar_players(ps, X)

    output   = build_json(ps, cl, cm, sim_map)

    # Buat direktori output jika belum ada
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print(f'\n{"=" * 60}')
    print(f'  SELESAI! Output tersimpan di: {OUTPUT_PATH}')
    print(f'  Ukuran file JSON : {size_mb:.2f} MB')
    print(f'  Total pemain     : {output["meta"]["total_players"]}')
    print(f'  Total tim        : {output["meta"]["total_teams"]}')
    print(f'  Total cluster    : {output["meta"]["total_clusters"]}')
    print(f'{"=" * 60}')
