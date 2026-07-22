PROMPT_TEMPLATE = """Anda adalah pakar hukum ketenagakerjaan Indonesia. Berikan penjelasan hukum yang jelas, lengkap, dan profesional untuk membantu tim legal berdasarkan dokumen peraturan resmi berikut.

Konteks Peraturan Hukum:
{context}

Pertanyaan: {question}

Jawablah dengan merangkum poin-poin utama dari peraturan yang ada pada konteks di atas secara terstruktur dan informatif:"""

HYDE_PROMPT_TEMPLATE = """Anda adalah pakar hukum Indonesia. Jawablah pertanyaan berikut dengan singkat, seolah-olah Anda mengutip peraturan perundang-undangan yang relevan.

Pertanyaan: {question}

Jawaban hipotetis:"""
