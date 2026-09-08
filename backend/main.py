import os
import uuid
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import (
    ProcessDocumentRequest, 
    CommunicationRequest, 
    SourceOfTruth, 
    GeneratedContent, 
    ValidationResult,
    UploadResponse
)
from llm_provider import LLMProvider, LocalNPUProvider
from mock_provider import MockProvider, DemoProvider
from local_llm_provider import LocalLLMProvider
from document_parser import extract_text_from_file

try:
    from gemini_provider import GeminiProvider
except Exception:
    GeminiProvider = None

load_dotenv()

app = FastAPI(title="NEXORA AI Backend", version="1.0.0")

cors_origins_env = os.getenv("CORS_ORIGINS", "*")
if cors_origins_env == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    allowed_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
    for local in ["http://localhost:5173", "http://127.0.0.1:5173"]:
        if local not in allowed_origins:
            allowed_origins.append(local)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_origin_regex=r"https://.*\.trycloudflare\.com|https://.*\.vercel\.app|https://.*\.onrender\.com",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Primary architecture: LocalLLMProvider with DemoProvider fallback
# Gemini is optional/deprecated legacy and never required.
use_legacy_gemini = os.getenv("USE_GEMINI", "false").lower() == "true" and bool(os.getenv("GEMINI_API_KEY"))
if use_legacy_gemini and GeminiProvider:
    provider: LLMProvider = GeminiProvider(os.getenv("GEMINI_API_KEY"))
else:
    provider: LLMProvider = LocalLLMProvider()

@app.get("/api/health")
def health_check():
    if isinstance(provider, LocalLLMProvider):
        is_local_available = provider.check_availability()
        if is_local_available:
            return {
                "status": "ok",
                "service": "Nexora AI Orchestration Engine",
                "provider": "LocalLLMProvider",
                "mode": "local",
                "model": provider.model_name,
                "endpoint": provider.base_url
            }
        else:
            return {
                "status": "ok",
                "service": "Nexora AI Orchestration Engine",
                "provider": "DemoProvider",
                "mode": "fallback",
                "detail": "Local LLM endpoint unreachable, operating in deterministic fallback mode",
                "local_endpoint": provider.base_url,
                "local_model": provider.model_name
            }
    elif isinstance(provider, (DemoProvider, MockProvider)):
        return {
            "status": "ok",
            "service": "Nexora AI Orchestration Engine",
            "provider": "DemoProvider",
            "mode": "fallback",
            "detail": "Deterministic Demo Provider active"
        }
    else:
        return {
            "status": "ok",
            "service": "Nexora AI Orchestration Engine",
            "provider": getattr(provider, "__class__", type(provider)).__name__,
            "mode": "legacy"
        }

@app.post("/api/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Accepts TXT, PDF, or DOCX documents, extracts text preserving Unicode,
    and returns extracted text and initial structured Source of Truth.
    """
    try:
        content_bytes = await file.read()
        if not content_bytes:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")
        
        extracted_text = extract_text_from_file(content_bytes, file.filename)
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Unable to extract text from this file.")
        
        sot = provider.extract_source_of_truth(extracted_text)
        ext = file.filename.lower().split('.')[-1] if '.' in file.filename else 'unknown'
        
        return UploadResponse(
            filename=file.filename,
            file_type=ext.upper(),
            extracted_text=extracted_text,
            source_of_truth=sot
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/extract", response_model=SourceOfTruth)
def extract_source_of_truth(req: ProcessDocumentRequest):
    try:
        if not req.text or not req.text.strip():
            raise HTTPException(status_code=400, detail="Document text cannot be empty.")
        return provider.extract_source_of_truth(req.text)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate", response_model=list[GeneratedContent])
def generate_packages(req: CommunicationRequest):
    results = []
    try:
        for role in req.roles:
            for fmt in req.formats:
                for lang in req.languages:
                    for channel in req.channels:
                        content = provider.generate_communication(
                            req.source_of_truth, role, fmt, lang, channel
                        )
                        results.append(GeneratedContent(
                            id=str(uuid.uuid4()),
                            role=role,
                            format=fmt,
                            language=lang,
                            channel=channel,
                            content=content
                        ))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
class ValidateRequest(BaseModel):
    source_of_truth: SourceOfTruth
    generated_content: str

@app.post("/api/validate", response_model=ValidationResult)
def validate_content(req: ValidateRequest):
    try:
        return provider.validate_content(req.source_of_truth, req.generated_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
