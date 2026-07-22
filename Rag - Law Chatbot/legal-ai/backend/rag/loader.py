import os
import glob
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

def load_and_split_documents(data_dir: str = "./data"):
    """
    Loads PDF documents, adds metadata, and splits into child chunks.
    """
    pdf_files = glob.glob(os.path.join(data_dir, "*.pdf"))
    all_pages = []
    
    for pdf_file in pdf_files:
        filename = os.path.basename(pdf_file)
        loader = PyPDFLoader(pdf_file)
        pages = loader.load()
        
        # Determine metadata based on filename
        jenis_peraturan = "PP" if "PP" in filename else "UU" if "UU" in filename else "Lainnya"
        
        import re
        nomor_match = re.search(r'Nomor\s+(\d+)', filename)
        tahun_match = re.search(r'Tahun\s+(\d+)', filename)
        
        nomor_peraturan = f"{jenis_peraturan} No. {nomor_match.group(1)}/{tahun_match.group(1)}" if nomor_match and tahun_match else filename
        tahun = tahun_match.group(1) if tahun_match else "Unknown"
        
        for page in pages:
            page.metadata.update({
                "jenis_peraturan": jenis_peraturan,
                "nomor_peraturan": nomor_peraturan,
                "tahun": tahun,
                "filename": filename
            })
            all_pages.append(page)
            
    print(f"Loaded {len(all_pages)} pages from {len(pdf_files)} PDF files.")
    
    # Child chunks for indexing in FAISS + BM25
    child_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=150
    )
    child_chunks = child_splitter.split_documents(all_pages)
    
    print(f"Split into {len(child_chunks)} child chunks.")
    return child_chunks
