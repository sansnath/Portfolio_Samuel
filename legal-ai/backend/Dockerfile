FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies (required for building some python packages and FAISS)
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better cache
COPY requirements.txt .

# Install PyTorch CPU version specifically for HuggingFace Spaces Free Tier (No GPU)
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install other dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create cache directories with appropriate permissions for HuggingFace Spaces
RUN mkdir -p /.cache/huggingface && chmod 777 /.cache/huggingface
ENV TRANSFORMERS_CACHE=/.cache/huggingface
ENV HF_HOME=/.cache/huggingface

# Copy the rest of the application
COPY . .

# Set proper permissions for the vectorstore directory so it can be read/written
RUN chmod -R 777 /app/vectorstore
RUN chmod -R 777 /app/data

# Expose port 7860 (Default for HuggingFace Spaces)
EXPOSE 7860

# Run FastAPI server on port 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
