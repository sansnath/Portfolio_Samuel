from typing import List
from langchain_community.embeddings import HuggingFaceEmbeddings

class E5Embeddings(HuggingFaceEmbeddings):
    """Custom wrapper for E5 models to prepend passage/query prefixes."""

    def __init__(self, model_name: str = "intfloat/multilingual-e5-base", **kwargs):
        # Default configuration for E5 models
        encode_kwargs = kwargs.pop("encode_kwargs", {})
        if "normalize_embeddings" not in encode_kwargs:
            encode_kwargs["normalize_embeddings"] = True
        
        super().__init__(model_name=model_name, encode_kwargs=encode_kwargs, **kwargs)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        # Prepend passage prefix for documents
        prefixed_texts = [f"passage: {text}" for text in texts]
        return super().embed_documents(prefixed_texts)

    def embed_query(self, text: str) -> List[float]:
        # Prepend query prefix for query
        prefixed_text = f"query: {text}"
        return super().embed_query(prefixed_text)

def get_embeddings_model():
    return E5Embeddings(
        model_name="intfloat/multilingual-e5-base",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True, 'batch_size': 32}
    )
