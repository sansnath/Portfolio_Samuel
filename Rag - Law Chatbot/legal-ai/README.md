# Legal AI Indonesia ⚖️

![Legal AI Indonesia Demo](https://via.placeholder.com/1200x600.png?text=Legal+AI+Indonesia)

Legal AI Indonesia adalah asisten hukum bertenaga kecerdasan buatan (AI) yang dirancang khusus untuk mempermudah akses dan pemahaman terhadap peraturan ketenagakerjaan di Indonesia. Aplikasi ini mampu menjawab pertanyaan seputar hukum dengan menyertakan kutipan (sitasi) dari dokumen hukum asli secara presisi.

## ✨ Fitur Utama

- 🧠 **Cerdas & Akurat**: Menjawab pertanyaan hukum kompleks berdasarkan Undang-Undang dan Peraturan Pemerintah.
- 📄 **Citation Cards**: Setiap jawaban disertai dengan kartu referensi dokumen hukum yang digunakan (misalnya PP No. 35/2021).
- ⚡ **RAG Architecture**: Menggunakan pendekatan *Retrieval-Augmented Generation* tingkat lanjut (HyDE, Dual Retrieval, CrossEncoder Reranker).
- 🌐 **Web Fallback**: Pencarian cerdas beralih ke sumber web jika jawaban tidak ditemukan di dokumen lokal.
- 🎨 **Premium UI**: Antarmuka responsif bergaya ChatGPT dengan mode gelap (*dark mode*) menggunakan Tailwind CSS dan Framer Motion.

## 🏗️ Arsitektur

![Arsitektur RAG](https://via.placeholder.com/800x400.png?text=RAG+Architecture)

Sistem ini terdiri dari dua bagian utama:
1. **Frontend (Next.js)**: Menyediakan *user interface* yang halus dan interaktif.
2. **Backend (FastAPI)**: Menjalankan *engine* RAG dan inferensi LLM:
   - **LLM**: `snssamuel/qwen2.5-3b-legal-chatbot-id` (Fine-tuned Qwen2.5)
   - **Vector Store**: FAISS + BM25 (Hybrid Search)
   - **Embedding**: `intfloat/multilingual-e5-base`
   - **Reranker**: `BAAI/bge-reranker-base`

## 🚀 Quick Start

### Persyaratan Sistem
- Python 3.10+
- Node.js 18+
- GPU dengan VRAM minimal 8GB (direkomendasikan untuk backend)

### Instalasi Backend

1. Buka terminal dan masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Buat Virtual Environment dan aktifkan:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Di Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Jalankan server FastAPI:
   ```bash
   python app.py
   ```
   *Backend akan berjalan di `http://localhost:8000`.*

### Instalasi Frontend

1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```
   *Buka `http://localhost:3000` di browser Anda.*

## 🛠️ Tech Stack

**Frontend**
- Next.js 14 (App Router)
- React, Tailwind CSS
- Framer Motion (Animasi)
- Lucide React (Ikon)

**Backend**
- FastAPI, Uvicorn
- LangChain, FAISS, PyPDF
- HuggingFace Transformers, BitsAndBytes, Peft
- PyTorch

## 🔮 Future Improvements

- **Streaming Response**: Jawaban muncul secara progresif kata per kata.
- **Fitur "Explain Simply"**: Penjelasan hukum menggunakan bahasa sehari-hari.
- **Compare Regulation**: Fitur membandingkan dua undang-undang secara berdampingan.
- **Chat History Persistence**: Menyimpan riwayat chat di database (PostgreSQL/MongoDB).
