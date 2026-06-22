# 🤖 Legal Chatbot Indonesia — Fine-tuning + RAG Pipeline

> Submission proyek akhir kelas **Penerapan Generative AI dan Besar Lainnya (PGABL)** — Dicoding  
> Studi kasus: Asisten hukum ketenagakerjaan berbasis dokumen regulasi resmi pemerintah Indonesia

---

## 📋 Deskripsi Proyek

Proyek ini membangun sistem **chatbot hukum berbahasa Indonesia** yang menggabungkan dua pendekatan utama:

1. **QLoRA Fine-tuning** — melatih ulang `Qwen2.5-3B-Instruct` pada dataset instruksi berbahasa Indonesia agar model memiliki kemampuan menjawab pertanyaan hukum ketenagakerjaan secara natural.
2. **Advanced RAG Pipeline** — sistem retrieval-augmented generation berlapis yang mengambil konteks dari 4 dokumen peraturan resmi, dilengkapi sitasi otomatis dan fallback ke pencarian web.

Model hasil fine-tuning telah dipublikasikan ke Hugging Face Hub dan digunakan langsung oleh pipeline RAG.

---

## 📁 Struktur Notebook

| File | Deskripsi |
|------|-----------|
| `Fine_tuning_submission_PGABL_Samuel_Nathanael.ipynb` | QLoRA fine-tuning Qwen2.5-3B-Instruct dengan dua eksperimen hyperparameter dan perbandingan kurva loss |
| `RAG_submission_PGABL_Samuel_Nathanael.ipynb` | Pipeline RAG advanced: HyDE + Ensemble Retriever + Reranker + DuckDuckGo fallback + Gradio interface |

---

## 🔗 Model di Hugging Face

**→ [snssamuel/qwen2.5-3b-legal-chatbot-id](https://huggingface.co/snssamuel/qwen2.5-3b-legal-chatbot-id)**

Model di-merge ke `merged_16bit` dan dapat digunakan langsung tanpa adapter tambahan.

---

## 📄 Dokumen Sumber (Knowledge Base)

Pipeline RAG mengindeks 4 regulasi resmi berikut:

| No | Dokumen | Topik Utama |
|----|---------|-------------|
| 1 | PP Nomor 5 Tahun 2021 | Penyelenggaraan perizinan berusaha berbasis risiko |
| 2 | PP Nomor 35 Tahun 2021 | PKWT, alih daya, waktu kerja, dan PHK |
| 3 | PP Nomor 51 Tahun 2023 | Pengupahan |
| 4 | UU Nomor 6 Tahun 2023 | Cipta Kerja (Omnibus Law) |

---

## 🏗️ Arsitektur Sistem

### Notebook 1 — Fine-tuning

```
Base Model: unsloth/Qwen2.5-3B-Instruct-bnb-4bit
    └─► LoRA Adapter (r=16, target: q/k/v/o/gate/up/down proj)
        └─► Dataset: Ichsan2895/alpaca-gpt4-indonesian (ChatML format)
            ├─► Eksperimen 1: batch=2, grad_accum=4, lr_scheduler=linear
            └─► Eksperimen 2: batch=1, grad_accum=6, lr_scheduler=cosine
                └─► Best model → push_to_hub (merged_16bit)
```

### Notebook 2 — RAG Pipeline

```
Pertanyaan User
    ├─► HyDE (Hypothetical Document Embeddings)
    │       └─► Generate 2 jawaban hipotetis → average embedding vector
    │
    ├─► Semantic Retrieval (FAISS + multilingual-e5-base)
    ├─► Lexical Retrieval (BM25)
    │       └─► Ensemble (BM25:Semantic = 0.4:0.6)
    │
    ├─► Cross-Encoder Reranker (BAAI/bge-reranker-base)
    │       └─► Top-K dengan threshold relevansi (sigmoid > 0.5)
    │
    ├─► [Relevan] Context dari dokumen + sitasi otomatis
    └─► [Tidak Relevan] Fallback: DuckDuckGo Web Search
            └─► LLM (Qwen2.5-3B fine-tuned) → Jawaban + Sitasi
```

---

## ✨ Fitur Teknis Unggulan

**Fine-tuning:**
- QLoRA dengan `unsloth` untuk efisiensi VRAM di Google Colab T4
- Dua eksperimen hyperparameter dengan perbandingan kurva train/eval loss
- Format dataset ChatML menggunakan `apply_chat_template` dari tokenizer Qwen
- Evaluasi berbasis eval loss (bukan hanya train loss)

**RAG Pipeline:**
- **Metadata enrichment** otomatis dari nama file PDF (jenis, nomor, tahun peraturan)
- **Parent-Child Retriever** untuk konteks hierarkis (chunk 400 vs 2000 karakter)
- **HyDE** untuk meningkatkan kualitas embedding query
- **Ensemble Retriever** BM25 + FAISS dengan bobot terpisah
- **Cross-Encoder reranker** untuk presisi akhir dokumen yang diambil
- **Metadata filtering** per jenis/nomor peraturan
- **Fallback DuckDuckGo** saat tidak ada dokumen yang relevan
- **Sitasi otomatis** `[N] PP/UU No. X/TAHUN, hal. Y`
- **Gradio interface** untuk demo interaktif (basic dan advanced)

---

## ⚙️ Setup & Instalasi

### Prasyarat

- Google Colab dengan runtime GPU (T4 atau lebih tinggi)
- Akun Hugging Face dengan write token (untuk push model)

### Instalasi Dependensi

```bash
# Unsloth (wajib dari git untuk Colab)
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install --no-deps "trl<0.9.0" peft accelerate bitsandbytes

# LangChain stack (versi pinned untuk kompatibilitas)
pip install \
  langchain==0.1.20 \
  langchain-core==0.1.52 \
  langchain-community==0.0.38 \
  langchain-text-splitters==0.0.2

# Retrieval & interface
pip install faiss-gpu rank_bm25 sentence-transformers pypdf gradio duckduckgo-search
```

Atau install sekaligus via:

```bash
pip install -r requirements.txt
```

> **Catatan:** `torch` dan `CUDA` sudah tersedia di bawaan Colab — tidak perlu di-install ulang.

### Persiapan Dokumen PDF

Letakkan 4 file PDF berikut di working directory sebelum menjalankan notebook RAG:

```
PP Nomor 5 Tahun 2021.pdf
PP Nomor 35 Tahun 2021.pdf
PP Nomor 51 Tahun 2023.pdf
UU Nomor 6 Tahun 2023.pdf
```

---

## 🚀 Cara Menjalankan

### Fine-tuning (Notebook 1)

1. Buka `Fine_tuning_submission_PGABL_Samuel_Nathanael.ipynb` di Google Colab
2. Pilih runtime GPU (T4 atau lebih tinggi)
3. Jalankan sel secara berurutan dari atas ke bawah
4. Di sel terakhir (push to Hub), masukkan Hugging Face write token ketika diminta

### RAG Pipeline (Notebook 2)

1. Upload 4 file PDF ke working directory Colab
2. Buka `RAG_submission_PGABL_Samuel_Nathanael.ipynb`
3. Jalankan sel secara berurutan
4. Demo Gradio akan muncul otomatis di sel 8 (basic) dan sel 15 (advanced)

---

## 🛠️ Stack Teknologi

| Kategori | Library / Model |
|----------|----------------|
| LLM Base | `Qwen2.5-3B-Instruct` (via Unsloth) |
| Fine-tuning | `unsloth`, `trl` (SFTTrainer), `peft`, `bitsandbytes` |
| Dataset | `Ichsan2895/alpaca-gpt4-indonesian` |
| Embedding | `intfloat/multilingual-e5-base` |
| Reranker | `BAAI/bge-reranker-base` |
| Vector Store | `FAISS` (GPU) |
| Lexical Search | `rank_bm25` |
| RAG Framework | `LangChain` (v0.1.20) |
| PDF Loader | `pypdf` via `PyPDFLoader` |
| Web Search | `duckduckgo-search` |
| Interface | `gradio` |

---

## 📊 Ringkasan Eksperimen Fine-tuning

| Parameter | Eksperimen 1 (Best) | Eksperimen 2 |
|-----------|---------------------|--------------|
| Batch size | 2 | 1 |
| Gradient accumulation | 4 steps | 6 steps |
| Effective batch size | 8 | 6 |
| LR scheduler | Linear | Cosine |
| Max seq length | 2048 | 1024 |
| LoRA dropout | 0 | 0.05 |
| Max steps | 800 | 800 |
| Eval strategy | Every 400 steps | — |
| **Eval loss** | **Lebih rendah & stabil** | Lebih tinggi |

Eksperimen 1 dipilih sebagai model terbaik karena eval loss lebih rendah dan lebih stabil — indikator kemampuan generalisasi yang lebih baik.

---

## 👤 Author

**Samuel Nathanael Sitompul**  
Mahasiswa Sistem Informasi, Universitas Brawijaya  
NIM: 235150407111034  
Hugging Face: [@snssamuel](https://huggingface.co/snssamuel)
