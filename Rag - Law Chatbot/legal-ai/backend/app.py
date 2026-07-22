import spaces
import os
import re
from typing import List, Optional
import numpy as np
import gradio as gr

from rag.retriever import get_hybrid_retriever
from rag.reranker import get_reranker, sigmoid
from rag.generator import get_llm, duckduckgo_search_fallback
from rag.prompt import PROMPT_TEMPLATE

# Global model instances for lazy loading
retriever = None
reranker = None
llm = None

def load_models_lazy():
    global retriever, reranker, llm
    if retriever is None or reranker is None or llm is None:
        print("Initializing Legal AI models lazily...")
        retriever = get_hybrid_retriever()
        reranker = get_reranker()
        llm = get_llm()
        print("All Legal AI models loaded successfully!")

def format_context_with_citations(docs):
    context_parts = []
    citations = []
    for i, doc in enumerate(docs):
        meta = doc.metadata
        page = meta.get("page", 0) + 1
        nomor_peraturan = meta.get("nomor_peraturan", meta.get("filename", "Dokumen Legal"))
        
        pasal = None
        pasal_match = re.search(r'(?i)Pasal\s+\d+', doc.page_content)
        if pasal_match:
            pasal = pasal_match.group(0)
            
        context_parts.append(f"[{i+1}] {nomor_peraturan}, Halaman {page}:\n{doc.page_content}")
        citations.append({
            "title": nomor_peraturan,
            "page": page,
            "pasal": pasal,
            "source": "dokumen_lokal"
        })
    return "\n\n".join(context_parts), citations

@spaces.GPU(duration=60)
def process_chat(question: str):
    load_models_lazy()
    if not question:
        return "Pertanyaan tidak boleh kosong.", [], "none", 0.0
        
    query_vector = retriever.embeddings.embed_query(question)
    docs = retriever.retrieve(query_vector=query_vector, query_text=question, k=10)
    reranked = reranker.rerank(question, docs, top_k=5)
    
    if not reranked:
        context, citations = duckduckgo_search_fallback(question, max_results=5)
        source_used = "duckduckgo"
        top1_score = 0.0
    else:
        top1_score = float(sigmoid(reranked[0][1]))
        if top1_score >= 0.45:
            top_docs = [d for d, _ in reranked]
            context, citations = format_context_with_citations(top_docs)
            source_used = "dokumen_lokal"
        else:
            context, citations = duckduckgo_search_fallback(question, max_results=5)
            source_used = "duckduckgo"
            
    final_prompt = PROMPT_TEMPLATE.format(context=context, question=question)
    answer = llm.generate(final_prompt, max_new_tokens=350)
    
    return answer, citations, source_used, top1_score

def format_citations_bullets(citations: List[dict], source_used: str, top1_score: float) -> str:
    if not citations:
        if source_used == "duckduckgo":
            return "\n\n📄 Dasar Hukum:\n• Pencarian Web Resmi (DuckDuckGo)"
        return ""

    ref_items = []
    seen = set()
    for c in citations:
        title = c.get('title', 'Dokumen Hukum')
        page_str = f"Halaman {c['page']}" if c.get('page') else ""
        pasal_str = f"{c['pasal']}" if (c.get('pasal') and c['pasal'] != "-") else ""

        details = ", ".join([p for p in [page_str, pasal_str] if p])
        item_text = f"{title} ({details})" if details else title
        
        if item_text not in seen:
            seen.add(item_text)
            ref_items.append(item_text)

    bullets = "\n".join([f"• {item}" for item in ref_items])
    score_pct = int(top1_score * 100) if top1_score > 0 else 0
    score_str = f"\n\n(Tingkat Relevansi Dokumen: {score_pct}%)" if score_pct > 0 else ""
    
    return f"\n\n📄 Dasar Hukum:\n{bullets}{score_str}"

def predict(question: str):
    try:
        answer, citations, source_used, top1_score = process_chat(question)
    except Exception as e:
        print(f"Execution note ({e}). Falling back...")
        load_models_lazy()
        query_vector = retriever.embeddings.embed_query(question)
        docs = retriever.retrieve(query_vector=query_vector, query_text=question, k=10)
        reranked = reranker.rerank(question, docs, top_k=5)
        if reranked and float(sigmoid(reranked[0][1])) >= 0.45:
            top_docs = [d for d, _ in reranked]
            context, citations = format_context_with_citations(top_docs)
            source_used = "dokumen_lokal"
            top1_score = float(sigmoid(reranked[0][1]))
        else:
            context, citations = duckduckgo_search_fallback(question, max_results=5)
            source_used = "duckduckgo"
            top1_score = float(sigmoid(reranked[0][1])) if reranked else 0.0
        final_prompt = PROMPT_TEMPLATE.format(context=context, question=question)
        answer = llm.generate(final_prompt, max_new_tokens=350)

    # Clean raw ** markdown bold symbols
    clean_answer = answer.replace("**", "")
    citations_output = format_citations_bullets(citations, source_used, top1_score)
    return f"{clean_answer}{citations_output}"

demo = gr.Interface(
    fn=predict,
    inputs=gr.Textbox(lines=2, placeholder="Tanyakan seputar hukum ketenagakerjaan..."),
    outputs="text",
    api_name="predict",
    title="⚖️ Legal AI Indonesia API Server",
    description="Server API RAG untuk Hukum Ketenagakerjaan. Terhubung dengan Frontend Next.js."
)

demo.launch()
