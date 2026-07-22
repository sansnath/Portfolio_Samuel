import os
from typing import List, Dict, Any
from langchain_community.vectorstores import FAISS
from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document
from .embeddings import get_embeddings_model
from .loader import load_and_split_documents

class HybridRetriever:
    def __init__(self, vectorstore_path: str = "./vectorstore/faiss_index_legal_docs", data_dir: str = "./data"):
        self.embeddings = get_embeddings_model()
        self.vectorstore_path = vectorstore_path
        self.data_dir = data_dir
        self.faiss_store = None
        self.bm25_retriever = None
        self._initialize_stores()

    def _initialize_stores(self):
        print("Initializing retrievers...")
        
        # Load or create FAISS and BM25 stores
        if os.path.exists(self.vectorstore_path) and os.path.exists(os.path.join(self.vectorstore_path, "index.faiss")):
            print(f"Loading existing FAISS index from {self.vectorstore_path}")
            self.faiss_store = FAISS.load_local(self.vectorstore_path, self.embeddings, allow_dangerous_deserialization=True)
            
            # Extract documents directly from FAISS docstore for BM25
            print("Building BM25 retriever from FAISS docstore...")
            docs = list(self.faiss_store.docstore._dict.values())
            if docs:
                self.bm25_retriever = BM25Retriever.from_documents(docs)
        else:
            print("FAISS index not found. Building from scratch...")
            child_chunks = load_and_split_documents(self.data_dir)
            if not child_chunks:
                print("Warning: No documents found to index.")
                return
            
            self.faiss_store = FAISS.from_documents(child_chunks, self.embeddings)
            os.makedirs(os.path.dirname(self.vectorstore_path), exist_ok=True)
            self.faiss_store.save_local(self.vectorstore_path)
            
            self.bm25_retriever = BM25Retriever.from_documents(child_chunks)
        
        print("Retrievers initialized.")

    def retrieve(self, query_vector: List[float], query_text: str, k: int = 5) -> List[Document]:
        """Dual retrieval using semantic and lexical search, then deduplicate."""
        semantic_docs = []
        bm25_docs = []
        
        if self.faiss_store:
            # We use similarity_search_by_vector because we will pass the HyDE vector
            semantic_docs = self.faiss_store.similarity_search_by_vector(query_vector, k=k)
            
        if self.bm25_retriever:
            bm25_docs = self.bm25_retriever.invoke(query_text)[:k]
            
        # Deduplicate and merge
        combined_docs = self._deduplicate(semantic_docs + bm25_docs)
        return combined_docs

    def _deduplicate(self, docs: List[Document]) -> List[Document]:
        seen = set()
        deduped = []
        for doc in docs:
            # Use first 200 chars as unique identifier as done in the notebook
            content_snippet = doc.page_content[:200]
            if content_snippet not in seen:
                seen.add(content_snippet)
                deduped.append(doc)
        return deduped

def get_hybrid_retriever():
    return HybridRetriever(
        vectorstore_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), "vectorstore", "faiss_index_legal_docs"),
        data_dir=os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    )
