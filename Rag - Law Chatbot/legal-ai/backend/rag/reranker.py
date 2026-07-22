from typing import List, Tuple
from langchain_core.documents import Document
from sentence_transformers import CrossEncoder
import numpy as np

class BGEReranker:
    def __init__(self, model_name: str = "BAAI/bge-reranker-base"):
        print(f"Loading reranker model {model_name}...")
        self.model = CrossEncoder(model_name, max_length=512, device="cpu")
        
    def rerank(self, query: str, docs: List[Document], top_k: int = 3) -> List[Tuple[Document, float]]:
        if not docs:
            return []
            
        pairs = [[query, doc.page_content] for doc in docs]
        scores = self.model.predict(pairs)
        
        # Zip docs with scores and sort by score descending
        doc_score_pairs = list(zip(docs, scores))
        doc_score_pairs.sort(key=lambda x: x[1], reverse=True)
        
        return doc_score_pairs[:top_k]

def sigmoid(x: float) -> float:
    return 1 / (1 + np.exp(-x))

def get_reranker():
    return BGEReranker()
