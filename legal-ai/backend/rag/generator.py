import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from duckduckgo_search import DDGS

class LegalLLM:
    def __init__(self, model_name: str = "snssamuel/qwen2.5-3b-legal-chatbot-id"):
        print(f"Loading user's fine-tuned model: {model_name}...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        if torch.cuda.is_available():
            print("CUDA available! Loading model in fp16 on GPU...")
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
                device_map="auto"
            )
        else:
            print("Loading model on CPU...")
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float32,
                device_map="cpu"
            )

    def generate(self, prompt: str, max_new_tokens: int = 350) -> str:
        messages = [
            {"role": "user", "content": prompt}
        ]
        text = self.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        inputs = self.tokenizer(text, return_tensors="pt").to(self.model.device)
        
        outputs = self.model.generate(
            **inputs, 
            max_new_tokens=max_new_tokens,
            pad_token_id=self.tokenizer.pad_token_id,
            eos_token_id=self.tokenizer.eos_token_id,
            do_sample=True,
            temperature=0.3,
            top_p=0.9
        )
        
        input_length = inputs["input_ids"].shape[1]
        response = self.tokenizer.decode(outputs[0][input_length:], skip_special_tokens=True)
        return response

def get_llm():
    return LegalLLM()

def duckduckgo_search_fallback(question: str, max_results: int = 5):
    ddgs = DDGS()
    try:
        results = ddgs.text(f"pengertian dan ketentuan PKWT pasal UU Cipta Kerja ketenagakerjaan indonesia {question}", max_results=max_results)
    except Exception:
        results = []
        
    if not results:
        return "PKWT (Perjanjian Kerja Waktu Tertentu) adalah perjanjian kerja antara pekerja/buruh dengan pengusaha untuk mengadakan hubungan kerja dalam waktu tertentu atau untuk pekerjaan tertentu yang diatur dalam UU Ketenagakerjaan dan PP No. 35 Tahun 2021.", []
        
    context_parts = []
    citations = []
    
    for i, res in enumerate(results):
        context_parts.append(f"Sumber {i+1} ({res.get('title', '')}): {res.get('body', '')}")
        citations.append({
            "title": res.get('title', 'Pencarian Web Hukum'),
            "url": res.get('href', ''),
            "source": "web"
        })
        
    context = "\n\n".join(context_parts)
    return context, citations
